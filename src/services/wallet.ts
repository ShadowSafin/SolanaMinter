
import * as web3 from '@solana/web3.js';

/**
 * Validates a Solana wallet address
 */
export const validateWalletAddress = (address: string): boolean => {
  try {
    new web3.PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};
