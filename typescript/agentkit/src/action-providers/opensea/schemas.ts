import { z } from "zod";

/**
 * Schema for listing an NFT on OpenSea.
 */
export const OpenSeaListNFTSchema = z.object({
  tokenId: z.string().nonempty("Token ID is required."),
  tokenAddress: z.string().nonempty("Token address is required."),
  listingPrice: z.number().positive("Listing price must be a positive number."),
});

/**
 * Schema for getting NFTs from a specific wallet address.
 */
export const OpenSeaGetNftsByAccount = z
  .object({})
  .strip()
  .describe("Input schema for fetching NFTs by account");
