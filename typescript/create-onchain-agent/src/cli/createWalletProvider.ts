import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import nunjucks from 'nunjucks';
import prompts from 'prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export async function createWalletProvider() {
    nunjucks.configure(path.join(__dirname, '../../../templates'), {
        autoescape: false,
        trimBlocks: true,
        lstripBlocks: true
    });

    const answers = await prompts([
        {
            type: 'text',
            name: 'name',
            message: 'What is the name of your wallet provider?',
            validate: (value: string) => value.length > 0 ? true : 'Name is required'
        },
        {
            type: 'text',
            name: 'description',
            message: 'Provide a brief description:',
            initial: (prev: string) => `${prev} wallet operations`
        },
        {
            type: 'select',
            name: 'protocolFamily',
            message: 'Which protocol family will this support?',
            choices: [
                { title: 'EVM', value: 'EVM' },
                { title: 'SVM', value: 'SVM' }
            ]
        }
    ]);

    const className = answers.name.charAt(0).toUpperCase() + answers.name.slice(1);
    const fileName = `${toCamelCase(answers.name)}WalletProvider`;
    const snakeName = toSnakeCase(answers.name);
    
    const baseClass = answers.protocolFamily === 'EVM' ? 'EvmWalletProvider' : 'SvmWalletProvider';

    const generatedCode = nunjucks.render('walletProvider/walletProvider.njk', {
        name: snakeName,
        className: fileName,
        description: answers.description,
        protocolFamily: answers.protocolFamily,
        baseClass
    });

    // Write file directly to current directory
    await fs.writeFile(`./${fileName}.ts`, generatedCode);

    console.log(`Successfully created ${fileName}!`);
}