
/**
 * Gets the current SOL price in USD
 */
export const getSolanaPrice = async (): Promise<number> => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    const data = await response.json();
    return data.solana.usd;
  } catch (error) {
    console.error("Error fetching SOL price:", error);
    return 150.25; // Fallback SOL price if API fails
  }
};
