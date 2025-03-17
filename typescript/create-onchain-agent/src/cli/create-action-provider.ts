import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import nunjucks from 'nunjucks';
import prompts from 'prompts';
import { getNetworkType } from '../utils';
import { Network, EVMNetwork, SVMNetwork } from '../types';

// Get current file's directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility functions for string transformations
function toKebabCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2') // Add hyphen between lower & upper
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2') // Add hyphen between consecutive uppers if followed by lower
        .toLowerCase();
}

function toSnakeCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2') // Add underscore between lower & upper
        .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2') // Add underscore between consecutive uppers if followed by lower
        .toLowerCase();
}

export async function createActionProvider() {
    // Configure nunjucks with the correct path
    nunjucks.configure(path.join(__dirname, '../../../templates'), {
        autoescape: false,
        trimBlocks: true,
        lstripBlocks: true
    });

    // Get user input
    const answers = await prompts([
        {
            type: 'text',
            name: 'name',
            message: 'What is the name of your action provider?',
            validate: (value: string) => value.length > 0 ? true : 'Name is required'
        },
        {
            type: 'text',
            name: 'description',
            message: 'Provide a brief description:',
            initial: (prev: string) => `${prev} operations`
        },
        {
            type: 'select',
            name: 'networkFamily',
            message: 'Which network family will this support?',
            choices: [
                { title: 'EVM', value: 'EVM' },
                { title: 'SVM', value: 'SVM' },
                { title: 'Both', value: 'Both' }
            ]
        }
    ]);

    // Process the name variations
    const className = answers.name.charAt(0).toUpperCase() + answers.name.slice(1);
    const kebabName = `${toKebabCase(answers.name)}-action-provider`;
    const snakeName = toSnakeCase(answers.name);
    
    // Determine wallet provider and networks based on network family
    let walletProvider = 'EvmWalletProvider';
    let networkSupport = 'true';

    switch(answers.networkFamily) {
        case 'EVM':
            walletProvider = 'EvmWalletProvider';
            networkSupport = 'network.protocolFamily === "EVM"';
            break;
        case 'SVM':
            walletProvider = 'SvmWalletProvider';
            networkSupport = 'network.protocolFamily === "SVM"';
            break;
        case 'Both':
            walletProvider = 'WalletProvider';
            networkSupport = 'true';
            break;
    }

    // Generate code using nunjucks
    const generatedCode = nunjucks.render('action-provider/template.njk', {
        name: snakeName,
        className,
        description: answers.description,
        walletProvider,
        networks: '[]',
        networkSupport,
        actionName: `${snakeName}_action`,
        schemaName: `${className}ActionSchema`
    });

    // Create directory if it doesn't exist
    const dirPath = `./${kebabName}`;
    await fs.mkdir(dirPath, { recursive: true });

    // Write files
    await fs.writeFile(`${dirPath}/${kebabName}.ts`, generatedCode);

    // Generate schema file using nunjucks with updated schema name
    const schemaCode = nunjucks.render('action-provider/schema.njk', {
        className: `${className}Action`,
        description: answers.description
    });

    await fs.writeFile(`${dirPath}/schemas.ts`, schemaCode);

    console.log(`Successfully created ${kebabName}!`);
}