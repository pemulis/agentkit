#!/usr/bin/env node
import { createActionProvider } from "./cli/create-action-provider.js";
import { createAgent } from "./cli/create-agent.js";
import { createAgentkit } from "./cli/create-agentkit.js";
import { createWalletProvider } from "./cli/create-wallet-provider.js";
import { initProject } from "./cli/init-project.js";

async function handleArgs() {
  console.log(process.argv);
  const type = process.argv[2];
  if (!type) {
    await initProject();
  }
  else {
    switch(type) {
      case 'init': {
        await initProject();
        break;
      }
      case 'action-provider': {
        await createActionProvider();
        break;
      }
      case 'wallet-provider': {
        await createWalletProvider();
        break;
      }
      case 'agentkit': {
        await createAgentkit();
        break;
      }
      case 'agent': {
        await createAgent();
        break;
      }
      default: {
        console.log('Unknown command:', type);
        break;
      }
    }
  }
}

handleArgs().catch(e => {
  console.error(e);
});
