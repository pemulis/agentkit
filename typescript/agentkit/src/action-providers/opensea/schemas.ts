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

/**
 * Schema for validating the response from the OpenSea API when listing an NFT.
 */
export const OpenSeaListNFTResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z
    .object({
      id: z.string(),
      tokenId: z.string(),
      contractAddress: z.string(),
      listingPrice: z.number(),
    })
    .optional(),
});
