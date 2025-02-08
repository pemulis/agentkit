import { z } from "zod";
import { ActionProvider } from "../actionProvider";
import { CreateAction } from "../actionDecorator";
import { OpenSeaSDK, Chain } from "opensea-js"; // Assuming an OpenSea SDK is available
import { Network } from "../../network";
import { OpenSeaGetNftsByAccount, OpenSeaListNFTSchema } from "./schemas";
import { ViemWalletProvider } from "../../wallet-providers";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, defineChain, http } from "viem";

export const sepolia = /*#__PURE__*/ defineChain({
  id: 11_155_111,
  name: "Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://sepolia.drpc.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://sepolia.etherscan.io",
      apiUrl: "https://api-sepolia.etherscan.io/api",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 751532,
    },
    ensRegistry: { address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" },
    ensUniversalResolver: {
      address: "0xc8Af999e38273D658BE1b921b88A9Ddf005769cC",
      blockCreated: 5_317_080,
    },
  },
  testnet: true,
});

/**
 * Configuration options for the OpenSeaActionProvider.
 */
export interface OpenSeaActionProviderConfig {
  apiKey?: string;
  walletPrivateKey: string;
}

/**
 * OpenSeaActionProvider is an action provider for interacting with OpenSea.
 *
 * @augments ActionProvider
 */
export class OpenSeaActionProvider extends ActionProvider {
  private readonly client: OpenSeaSDK;

  /**
   * Constructor for the OpenSeaActionProvider class.
   *
   * @param config - The configuration options for the OpenSeaActionProvider
   */
  constructor(config: OpenSeaActionProviderConfig) {
    super("opensea", []);

    config.apiKey ||= process.env.OPENSEA_API_KEY;

    if (!config.apiKey) {
      throw new Error("OPENSEA_API_KEY is not configured.");
    }

    const walletClient = createWalletClient({
      account: privateKeyToAccount(config.walletPrivateKey as `0x${string}`),
      chain: sepolia,
      transport: http(),
    });

    const walletProvider = new ViemWalletProvider(walletClient);

    //@ts-expect-error: OpenSeaSDK constructor expects a different type for walletProvider
    this.client = new OpenSeaSDK(walletProvider, {
      chain: Chain.Sepolia,
      apiKey: config.apiKey,
    });
  }

  /**
   * List an NFT on OpenSea.
   *
   * @param args - The arguments containing the NFT details
   * @returns A JSON string containing the listing details or error message
   */
  @CreateAction({
    name: "list_nft",
    description: `
This tool will list an NFT on OpenSea. The tool takes the token ID, contract address, and listing price as input.

A successful response will return a message with the API response as a JSON payload:
    {"success": true, "message": "NFT listed successfully."}

A failure response will return a message with an error:
    Error listing NFT: Insufficient funds.`,
    schema: OpenSeaListNFTSchema,
  })
  async listNFT(args: z.infer<typeof OpenSeaListNFTSchema>): Promise<string> {
    try {
      const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24);
      const response = await this.client.createListing({
        asset: {
          tokenId: args.tokenId,
          tokenAddress: args.tokenAddress,
        },
        accountAddress: "",
        startAmount: args.listingPrice,
        expirationTime,
      });
      return `Successfully listed NFT:\n${JSON.stringify(response)}`;
    } catch (error) {
      return `Error listing NFT:\n${error}`;
    }
  }

  /**
   * Fetch NFTs of a specific wallet address.
   *
   * @param _ - Empty parameter object (not used)
   * @returns A JSON string containing the NFTs or error message
   */
  @CreateAction({
    name: "get_nfts_by_account",
    description: `
  This tool will fetch NFTs of a specific wallet address. The tool takes the wallet address as input.
  
  A successful response will return a message with the NFTs as a JSON payload:
      {"success": true, "nfts": [...]}
  A failure response will return a message with an error:
      Error fetching NFTs: <error_message>`,
    schema: OpenSeaGetNftsByAccount,
  })
  async fetchNFTs(_: z.infer<typeof OpenSeaGetNftsByAccount>): Promise<string> {
    try {
      const nfts = await this.client.api.getNFTsByAccount("");
      return JSON.stringify({ success: true, nfts });
    } catch (error) {
      return `Error fetching NFTs: ${error}`;
    }
  }

  /**
   * Checks if the OpenSea action provider supports the given network.
   *
   * @param _ - The network to check (not used)
   * @returns Always returns true as OpenSea actions are network-independent
   */
  supportsNetwork(_: Network): boolean {
    return true;
  }
}

/**
 * Factory function to create a new OpenSeaActionProvider instance.
 *
 * @param config - The configuration options for the OpenSeaActionProvider
 * @returns A new instance of OpenSeaActionProvider
 */
export const openSeaActionProvider = (config: OpenSeaActionProviderConfig) =>
  new OpenSeaActionProvider(config);
