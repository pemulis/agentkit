import { PrivyWalletConfig, PrivyWalletProvider, PrivyEvmWalletProvider, PrivySvmWalletProvider, PrivyWalletExport } from "@coinbase/agentkit";
import fs from "fs";

interface WalletProviderConfig {
  walletDataFilePath: string;
  walletDefaultChainId: string;
}

/**
 * Loads saved wallet data from the filesystem
 * 
 * @param walletDataFilePath - Path to the wallet data file
 * @returns The saved wallet data, or null if no data exists or there was an error reading the file
 */
export function loadSavedWalletData(walletDataFilePath: string): PrivyWalletExport | null {
  try {
    if (fs.existsSync(walletDataFilePath)) {
      return JSON.parse(fs.readFileSync(walletDataFilePath, "utf8"));
    }
  } catch {
    // fail silently for reads since this is expected when no wallet exists
  }
  return null;
}

/**
 * Saves wallet data to the filesystem
 * 
 * @param walletDataFilePath - Path to the wallet data file
 * @param walletData - The wallet data to save
 * @throws {Error} If there was an error writing the file
 */
export function saveWalletData(walletDataFilePath: string, walletData: PrivyWalletExport): void {
  const jsonData = JSON.stringify(walletData, null, 2);
  try {
    fs.writeFileSync(walletDataFilePath, jsonData);
  } catch (error) {
    // do not fail silently, dump the error to the console with the wallet's json data
    console.error("Failed to save wallet data:", jsonData);
    throw new Error(`Failed to save wallet data (${jsonData}): ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates the base configuration for a Privy wallet
 * 
 * @param savedWallet - Previously saved wallet data, if any
 * @returns Base configuration for a Privy wallet
 */
function getBaseConfig(savedWallet: PrivyWalletExport | null) {
  const walletId = savedWallet?.walletId || process.env.PRIVY_WALLET_ID as string;

  return {
    appId: process.env.PRIVY_APP_ID as string,
    appSecret: process.env.PRIVY_APP_SECRET as string,
    authorizationKeyId: process.env.PRIVY_WALLET_AUTHORIZATION_KEY_ID,
    authorizationPrivateKey: process.env.PRIVY_WALLET_AUTHORIZATION_PRIVATE_KEY,
    walletId,
  };
}

/**
 * Creates configuration for an Ethereum wallet
 * 
 * @param savedWallet - Previously saved wallet data, if any
 * @param defaultChainId - Default chain ID to use if none is specified
 * @returns Configuration for an Ethereum wallet
 */
export function createEthereumConfig(savedWallet: PrivyWalletExport | null, defaultChainId: string): PrivyWalletConfig {
  const chainId = savedWallet?.chainId || process.env.CHAIN_ID || defaultChainId;

  if (!process.env.CHAIN_ID && !savedWallet?.chainId) {
    console.warn("Warning: CHAIN_ID not set, defaulting to 'base-sepolia'");
  }

  return {
    ...getBaseConfig(savedWallet),
    chainId,
    chainType: "ethereum",
  };
}

/**
 * Creates configuration for a Solana wallet
 * 
 * @param networkId - The Solana network ID to use
 * @param savedWallet - Previously saved wallet data, if any
 * @returns Configuration for a Solana wallet
 */
export function createSolanaConfig(networkId: string, savedWallet: PrivyWalletExport | null): PrivyWalletConfig {
  return {
    ...getBaseConfig(savedWallet),
    chainType: "solana",
    networkId: savedWallet?.networkId || networkId,
    chainId: savedWallet?.chainId,
  };
}

/**
 * Initializes a wallet provider using saved wallet data if available
 * 
 * @param config - Configuration for the wallet provider
 * @returns A configured wallet provider
 * @throws {Error} If there is a wallet ID mismatch between saved and exported data
 */
export async function initializeWalletProvider(config: WalletProviderConfig): Promise<PrivyEvmWalletProvider | PrivySvmWalletProvider> {
  const networkId = process.env.NETWORK_ID;
  const savedWallet = loadSavedWalletData(config.walletDataFilePath);

  const walletConfig = networkId?.includes("solana") ?
    createSolanaConfig(networkId, savedWallet) :
    createEthereumConfig(savedWallet, config.walletDefaultChainId);

  const walletProvider = await PrivyWalletProvider.configureWithWallet(walletConfig);
  const exportedWallet = walletProvider.exportWallet();

  if (savedWallet && savedWallet.walletId !== exportedWallet.walletId) {
    throw new Error(`Wallet ID mismatch. Expected ${savedWallet.walletId} but got ${exportedWallet.walletId}`);
  }

  if (!savedWallet) {
    saveWalletData(config.walletDataFilePath, exportedWallet);
  }

  return walletProvider;
} 