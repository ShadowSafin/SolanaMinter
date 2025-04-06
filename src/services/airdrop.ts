
import { SOLANA_NETWORK } from "@/lib/constants";
import * as web3 from '@solana/web3.js';

/**
 * For devnet only - request a SOL airdrop
 */
export const requestDevnetAirdrop = async (address: string, amount: number = 1): Promise<boolean> => {
  try {
    if (SOLANA_NETWORK !== 'devnet') {
      throw new Error("Airdrop is only available on devnet");
    }
    
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
    const publicKey = new web3.PublicKey(address);
    
    const signature = await connection.requestAirdrop(
      publicKey,
      amount * web3.LAMPORTS_PER_SOL
    );
    
    await connection.confirmTransaction(signature, 'confirmed');
    return true;
  } catch (error) {
    console.error("Error requesting airdrop:", error);
    return false;
  }
};
