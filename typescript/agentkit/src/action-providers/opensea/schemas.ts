import { z } from "zod";

/**
 * Schema for listing an NFT on OpenSea.
 */
export const OpenSeaListNFTSchema = z.object({
  tokenId: z.string().nonempty().describe("Token ID is required."),
  tokenAddress: z.string().nonempty().describe("Token address is required."),
  listingPrice: z.number().positive().describe("Listing price must be a positive number."),
  expiresInDays: z.number().positive().describe("The number of days the listing will be active for."),
});

/**
 * Schema for getting NFTs from a specific wallet address.
 */
export const OpenSeaGetNftsByAccount = z
  .object({
    accountAddress: z.string().nonempty().describe("Account address is required."),
  })
  .strip()
  .describe("Input schema for fetching NFTs by account");
