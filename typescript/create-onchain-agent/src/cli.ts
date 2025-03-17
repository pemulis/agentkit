#!/usr/bin/env node
import { createActionProvider } from "./cli/createActionProvider.js";
import { createAgent } from "./cli/createAgent.js";
import { createAgentkit } from "./cli/createAgentkit.js";
import { createWalletProvider } from "./cli/createWalletProvider.js";
import { initProject } from "./cli/init-project.js";

async function handleArgs() {
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
