import { OpenSeaSDK } from "opensea-js";
import { z } from "zod";
import { Network } from "../../network";
import { ViemWalletProvider } from "../../wallet-providers";
import { CreateAction } from "../actionDecorator";
import { ActionProvider } from "../actionProvider";
import { OpenSeaGetNftsByAccount, OpenSeaListNFTSchema } from "./schemas";

/**
 * Configuration options for the OpenSeaActionProvider.
 */
export interface OpenSeaActionProviderConfig {
  apiKey?: string;
}

/**
 * OpenSeaActionProvider is an action provider for interacting with OpenSea.
 *
 * @augments ActionProvider
 */
export class OpenSeaActionProvider extends ActionProvider<ViemWalletProvider> {
  #openseaApiKey?: string;

  /**
   * Constructor for the OpenSeaActionProvider class.
   *
   * @param config - The configuration options for the OpenSeaActionProvider
   */
  constructor(config: OpenSeaActionProviderConfig) {
    super("opensea", []);
    this.#openseaApiKey = config.apiKey || process.env.OPENSEA_API_KEY;
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
  async listNFT(walletProvider: ViemWalletProvider, args: z.infer<typeof OpenSeaListNFTSchema>): Promise<string> {
    const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24 * args.expiresInDays);
    const response = await this.getClient(walletProvider).createListing({
      asset: {
        tokenId: args.tokenId,
        tokenAddress: args.tokenAddress,
      },
      accountAddress: walletProvider.getAddress(),
      startAmount: args.listingPrice,
      expirationTime,
    });

    return JSON.stringify(response);
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
  async fetchNFTs(walletProvider: ViemWalletProvider, _: z.infer<typeof OpenSeaGetNftsByAccount>): Promise<string> {
    const { nfts } = await this.getClient(walletProvider).api.getNFTsByAccount(walletProvider.getAddress());
    return JSON.stringify(nfts);
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

  getClient(walletProvider: ViemWalletProvider): OpenSeaSDK {
    //@ts-expect-error: OpenSeaSDK constructor expects a different type for walletProvider
    return new OpenSeaSDK(walletProvider, {
      apiKey: this.#openseaApiKey,
    });
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
