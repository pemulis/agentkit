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
function toCamelCase(str: string): string {
    // First character should be lowercase
    return str.charAt(0).toLowerCase() + str.slice(1);
}

function toSnakeCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
        .toLowerCase();
}

function toClassName(str: string): string {
    // Capitalize first letter of each word, remove any "Provider" suffix
    return str
        .split(/(?=[A-Z])|[\s_-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('')
        .replace(/Provider$/, '');
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
    const baseName = toClassName(answers.name);
    const className = `${baseName}ActionProvider`;
    const fileName = `${toCamelCase(baseName)}ActionProvider`;
    const snakeName = toSnakeCase(answers.name);
    const exportName = `${toCamelCase(baseName)}ActionProvider`;
    
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
    const generatedCode = nunjucks.render('actionProvider/actionProvider.njk', {
        name: exportName,
        className,
        walletProvider,
        networks: '[]',
        networkSupport,
        actionName: `${snakeName}_action`,
        schemaName: `${baseName}ActionSchema`
    });

    // Create directory if it doesn't exist
    const dirPath = `./${fileName}`;  // Use camelCase fileName for directory
    await fs.mkdir(dirPath, { recursive: true });

    // Write files
    await fs.writeFile(`${dirPath}/${fileName}.ts`, generatedCode);  // Use camelCase fileName for the file

    // Generate schema file using nunjucks with updated schema name
    const schemaCode = nunjucks.render('actionProvider/schema.njk', {
        className: `${baseName}Action`,
    });

    await fs.writeFile(`${dirPath}/schemas.ts`, schemaCode);

    console.log(`Successfully created ${className}!`);
}