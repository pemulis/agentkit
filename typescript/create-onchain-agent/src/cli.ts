#!/usr/bin/env node
import { createActionProvider } from "./actions/createActionProvider.js";
import { createAgent } from "./actions/createAgent.js";
import { createAgentkit } from "./actions/createAgentkit.js";
import { createWalletProvider } from "./actions/createWalletProvider.js";
import { initProject } from "./actions/initProject.js";

/**
 * Handles command line arguments and executes the appropriate action
 */
async function handleArgs() {
  const type = process.argv[2];
  if (!type) {
    await initProject();
  } else {
    switch (type) {
      case "init": {
        await initProject();
        break;
      }
      case "action-provider": {
        await createActionProvider();
        break;
      }
      case "wallet-provider": {
        await createWalletProvider();
        break;
      }
      case "agentkit": {
        await createAgentkit();
        break;
      }
      case "agent": {
        await createAgent();
        break;
      }
      default: {
        console.log("Unknown command:", type);
        break;
      }
    }
  }
}

handleArgs().catch(e => {
  console.error(e);
});
