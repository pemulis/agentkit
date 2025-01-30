import { TransactionRequest, createPublicClient, http } from "viem";
import { EvmWalletProvider } from "./evm_wallet_provider";
import { Network } from "./wallet_provider";
import { 
  createBundlerClient, 
  type BundlerClient,
  type SmartAccount
} from "viem/account-abstraction";

export class SmartWalletProvider extends EvmWalletProvider {
  #account: SmartAccount;
  #bundlerClient: BundlerClient;

  constructor({ 
    account, 
    bundlerUrl,
    chain 
  }: { 
    account: SmartAccount;
    bundlerUrl: string;
    chain: any;
  }) {
    super();
    this.#account = account;

    // Create public client for chain interaction
    const publicClient = createPublicClient({
      chain,
      transport: http()
    });

    // Create bundler client with our account
    this.#bundlerClient = createBundlerClient({
      account,
      client: publicClient,
      transport: http(bundlerUrl)
    });
  }

  async signMessage(message: string): Promise<`0x${string}`> {
    // Smart accounts have message signing built in
    return this.#account.signMessage({
      message
    });
  }

  async signTypedData(typedData: any): Promise<`0x${string}`> {
    return this.#account.signTypedData({
      domain: typedData.domain,
      types: typedData.types,
      primaryType: typedData.primaryType,
      message: typedData.message,
    });
  }

  async signTransaction(transaction: TransactionRequest): Promise<`0x${string}`> {
    // For smart accounts, we create a user operation and sign it
    const userOp = await this.#bundlerClient.prepareUserOperation({
      calls: [{
        to: transaction.to,
        value: transaction.value,
        data: transaction.data
      }]
    });

    // Sign the user operation
    return this.#account.signUserOperation(userOp);
  }

  async sendTransaction(transaction: TransactionRequest): Promise<`0x${string}`> {
    // Send the user operation through the bundler
    const hash = await this.#bundlerClient.sendUserOperation({
      calls: [{
        to: transaction.to,
        value: transaction.value,
        data: transaction.data
      }]
    });
    
    return hash;
  }

  getAddress(): string {
    return this.#account.address;
  }

  getNetwork(): Network {
    return {
      protocolFamily: "evm",
      chainId: this.#bundlerClient.chain.id.toString()
    };
  }

  getName(): string {
    return "smart_wallet_provider";
  }

  async waitForTransactionReceipt(txHash: `0x${string}`): Promise<any> {
    // Use bundler client to wait for transaction receipt
    return await this.#bundlerClient.waitForUserOperationReceipt({ 
      hash: txHash 
    });
  }
}

// Example usage:
/*
import { toCoinbaseSmartAccount } from "viem/account-abstraction";
import { mainnet } from "viem/chains";

// Create smart account
const account = await toCoinbaseSmartAccount({
  client: publicClient,
  owners: [owner] // owner could be EOA or WebAuthn
});

// Create provider
const smartWalletProvider = new SmartWalletProvider({
  account,
  bundlerUrl: "https://public.pimlico.io/v2/1/rpc",
  chain: mainnet
});
*/