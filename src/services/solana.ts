
import { PublicKey, Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FEES, SOLANA_CLUSTER_API, SOLANA_NETWORK, CoinCreationParams } from '@/lib/constants';
import { uploadFileToPinata, uploadJsonToPinata, getIpfsGatewayUrl } from '@/services/pinata';
import { toast } from '@/utils/toast'; // Fixed import
import { createTokenMetadata, findMetadataAddress } from '@/services/metaplex';
import { createCoinTransaction, processMetadataCreation } from '@/services/tokenCreation';

// Sleep utility to wait for a specific amount of time
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculates the total fee based on the provided parameters
 */
export function calculateTotalFee(params: CoinCreationParams): number {
  let fee = FEES.BASE_FEE;
  
  if (params.revokeMint) fee += FEES.REVOKE_MINT;
  if (params.revokeUpdate) fee += FEES.REVOKE_UPDATE;
  if (params.revokeFreeze) fee += FEES.REVOKE_FREEZE;
  if (params.socials.length > 0) fee += FEES.SOCIALS_UPDATE;
  
  return parseFloat(fee.toFixed(2));
}

/**
 * Detect available wallet adapters
 */
export function detectWallets(): string[] {
  const wallets = [];
  
  if ((window as any).solana?.isPhantom) wallets.push('phantom');
  if ((window as any).solflare) wallets.push('solflare');
  if ((window as any).backpack) wallets.push('backpack');
  if ((window as any).glowSolana) wallets.push('glow');
  
  return wallets;
}

/**
 * Connect to a Solana wallet
 */
export async function connectWallet(walletId: string = 'phantom'): Promise<{ 
  status: string; 
  address?: string; 
  balance?: number;
  walletProvider?: string;
  error?: string;
}> {
  try {
    let wallet;
    
    // Get the appropriate wallet provider
    if (walletId === 'phantom' && (window as any).solana) {
      wallet = (window as any).solana;
    } else if (walletId === 'solflare' && (window as any).solflare) {
      wallet = (window as any).solflare;
    } else if (walletId === 'backpack' && (window as any).backpack) {
      wallet = (window as any).backpack;
    } else if (walletId === 'glow' && (window as any).glowSolana) {
      wallet = (window as any).glow;
      walletId = 'glow';
    } else {
      return { 
        status: "error",
        error: `${walletId} wallet is not installed or available`
      };
    }
    
    // Connect to the wallet
    try {
      await wallet.connect();
    } catch (err: any) {
      // If the wallet is already connected, this will throw an error
      if (!err.message?.includes('already connected')) {
        throw err;
      }
    }
    
    if (!wallet.publicKey) {
      return { 
        status: "error",
        error: "Wallet connection was approved but public key is not available"
      };
    }
    
    const address = wallet.publicKey.toString();
    const balance = await getWalletBalance(address);
    
    return {
      status: "connected",
      address,
      balance,
      walletProvider: walletId
    };
  } catch (error: any) {
    console.error("Error connecting wallet:", error);
    return { 
      status: "error",
      error: error.message || "Could not connect to wallet"
    };
  }
}

/**
 * Disconnect from the currently connected wallet
 */
export async function disconnectWallet(walletId: string = 'phantom'): Promise<boolean> {
  try {
    let wallet;
    
    if (walletId === 'phantom' && (window as any).solana) {
      wallet = (window as any).solana;
    } else if (walletId === 'solflare' && (window as any).solflare) {
      wallet = (window as any).solflare;
    } else if (walletId === 'backpack' && (window as any).backpack) {
      wallet = (window as any).backpack;
    } else if (walletId === 'glow' && (window as any).glowSolana) {
      wallet = (window as any).glowSolana;
    } else {
      return false;
    }
    
    await wallet.disconnect();
    return true;
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
    return false;
  }
}

/**
 * Get the SOL balance of a wallet address
 */
export async function getWalletBalance(address: string): Promise<number> {
  try {
    const connection = new Connection(SOLANA_CLUSTER_API);
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return 0;
  }
}

/**
 * Request an airdrop of SOL to the specified address (devnet only)
 */
export async function requestAirdrop(address: string): Promise<boolean> {
  try {
    const connection = new Connection(SOLANA_CLUSTER_API);
    const publicKey = new PublicKey(address);
    
    const signature = await connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL);
    
    // Wait for confirmation
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...latestBlockhash
    });
    
    toast.success("Airdrop successful", {
      description: "1 SOL has been airdropped to your wallet"
    });
    
    return true;
  } catch (error) {
    console.error("Error requesting airdrop:", error);
    toast.error("Airdrop failed", {
      description: "Could not airdrop SOL to your wallet. Try again later."
    });
    return false;
  }
}

/**
 * Create a new SPL token with metadata
 */
export async function createCoin(params: CoinCreationParams, walletAddress: string, walletProvider: string): Promise<{
  success: boolean;
  mintAddress?: string;
  metadataAddress?: string;
  transactionId?: string;
  error?: string;
}> {
  let wallet;
  if (walletProvider === 'phantom') wallet = (window as any).solana;
  else if (walletProvider === 'solflare') wallet = (window as any).solflare;
  else if (walletProvider === 'backpack') wallet = (window as any).backpack;
  else if (walletProvider === 'glow') wallet = (window as any).glowSolana;
  
  if (!wallet) {
    return {
      success: false,
      error: "Wallet not found or not connected"
    };
  }
  
  try {
    // Create a connection to the Solana network
    const connection = new Connection(SOLANA_CLUSTER_API);
    
    // Simulate the transaction to see if it would be successful
    const simulatedFee = calculateTotalFee(params);
    const walletBalance = await getWalletBalance(walletAddress);
    
    if (walletBalance < simulatedFee) {
      return {
        success: false,
        error: `Insufficient funds. You need at least ${simulatedFee} SOL but have ${walletBalance.toFixed(4)} SOL.`
      };
    }
    
    // Start creating the token
    toast.info("Creating token", {
      description: "Please confirm the transaction in your wallet"
    });
    
    // Create the token mint
    const result = await createCoinTransaction(params, walletAddress, walletProvider);
    
    if (!result.success || !result.mintAddress) {
      throw new Error(result.error || "Failed to create token mint");
    }
    
    const mintAddress = result.mintAddress;
    const transactionSignature = result.transactionId;
    
    toast.success("Token created successfully!", {
      description: `Your token has been created with address: ${mintAddress.substring(0, 8)}...`,
      duration: 5000,
    });
    
    // Wait a bit longer for blockchain confirmation to ensure mint is ready
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Upload metadata if includeMetadata is true
    if (params.includeMetadata) {
      toast.info("Adding token metadata...", {
        description: "This will require another transaction",
        duration: 5000,
      });
      
      try {
        const metadataResult = await processMetadataCreation(
          params,
          walletAddress,
          wallet,
          mintAddress
        );
        
        if (metadataResult.success) {
          toast.success("Metadata added successfully!", {
            description: "Your token now has on-chain metadata",
            duration: 5000,
          });
        } else {
          toast.error("Failed to add metadata", {
            description: metadataResult.error || "Unknown error occurred",
            duration: 5000,
          });
          console.error("Metadata error:", metadataResult.error);
        }
      } catch (metadataError) {
        console.error("Error in metadata process:", metadataError);
        toast.error("Error adding metadata", {
          description: "An unexpected error occurred while adding metadata",
          duration: 5000,
        });
      }
    }
    
    return {
      success: true,
      mintAddress: mintAddress,
      transactionId: transactionSignature,
    };
  } catch (error: any) {
    console.error("Error creating token:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred while creating token"
    };
  }
}

// Utility functions to work with the browser-compatible approach
async function handleFileUpload(file: File, name: string): Promise<{success: boolean, ipfsHash?: string, error?: string}> {
  try {
    // Use our pinata service
    const result = await uploadFileToPinata(file, name);
    return result;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error uploading file'
    };
  }
}

async function handleJsonUpload(metadata: any, name: string): Promise<{success: boolean, ipfsHash?: string, error?: string}> {
  try {
    // Use our pinata service
    const result = await uploadJsonToPinata(metadata, name);
    return result;
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error uploading metadata'
    };
  }
}
