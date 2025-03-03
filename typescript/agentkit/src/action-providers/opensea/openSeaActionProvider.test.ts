import { OpenSeaActionProvider } from "./openSeaActionProvider";
import { ViemWalletProvider } from "../../wallet-providers";
import { OpenSeaSDK } from "opensea-js";
import { createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { jest } from "@jest/globals";

jest.mock("../../wallet-providers");

const mockWalletClient = createWalletClient({
  account: privateKeyToAccount("0x123456789abcdef"),
  chain: sepolia,
  transport: http(),
});

// Mock OpenSeaSDK class constructor
jest.mock("opensea-js", () => {
  return {
    OpenSeaSDK: jest.fn().mockImplementation(() => ({
      createListing: jest.fn(),
      api: { getNFTsByAccount: jest.fn() },
    })),
  };
});

describe("OpenSeaActionProvider", () => {
  let actionProvider;
  let mockOpenSeaClient;
  let mockWalletProvider;

  beforeEach(() => {
    mockWalletProvider = new ViemWalletProvider(mockWalletClient);
    mockWalletProvider.getAddress = jest.fn().mockReturnValue("0xTestWalletAddress");

    // Initialize the mocked OpenSeaSDK instance
    mockOpenSeaClient = new OpenSeaSDK(mockWalletProvider);

    actionProvider = new OpenSeaActionProvider({});
  });

  test("listNFT should successfully list an NFT", async () => {
    mockOpenSeaClient.createListing.mockResolvedValue({ listingId: "1234" });

    const response = await actionProvider.listNFT({
      tokenId: "1",
      tokenAddress: "0xTokenAddress",
      listingPrice: 0.1,
    });

    expect(mockOpenSeaClient.createListing).toHaveBeenCalledWith({
      asset: { tokenId: "1", tokenAddress: "0xTokenAddress" },
      accountAddress: "0xTestWalletAddress",
      startAmount: 0.1,
      expirationTime: expect.any(Number),
    });

    expect(response).toContain("Successfully listed NFT");
  });

  test("listNFT should handle errors gracefully", async () => {
    mockOpenSeaClient.createListing.mockRejectedValue(new Error("Insufficient funds"));

    const response = await actionProvider.listNFT({
      tokenId: "1",
      tokenAddress: "0xTokenAddress",
      listingPrice: 0.1,
    });

    expect(response).toContain("Error listing NFT");
    expect(response).toContain("Insufficient funds");
  });

  test("fetchNFTs should return NFT list successfully", async () => {
    const mockNFTs = [{ id: "1", name: "Test NFT" }];
    mockOpenSeaClient.api.getNFTsByAccount.mockResolvedValue(mockNFTs);

    const response = await actionProvider.fetchNFTs({});
    expect(JSON.parse(response)).toEqual({ success: true, nfts: mockNFTs });
  });

  test("fetchNFTs should handle errors gracefully", async () => {
    mockOpenSeaClient.api.getNFTsByAccount.mockRejectedValue(new Error("API error"));

    const response = await actionProvider.fetchNFTs({});
    expect(response).toContain("Error fetching NFTs");
    expect(response).toContain("API error");
  });
});
