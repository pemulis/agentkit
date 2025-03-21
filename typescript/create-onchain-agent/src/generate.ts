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
  const command = process.argv[2];
  if (command) {
    switch(command) {
      case 'new': {
        await initProject();
        break;
      }
      case 'generate': {
        const type = process.argv[3];
        switch (type) {
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
            console.log("Unknown command:", command, type);
            break;
          }
        }
      }
      default: {
        console.log("Unknown command:", command);
        break;
      }
    }
  }
  else {
    console.log("No command provided");
  }
}

handleArgs().catch(e => {
  console.error(e);
});
