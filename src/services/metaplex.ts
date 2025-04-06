import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';
import { TokenStandard, createMetadataAccountV3 } from '@metaplex-foundation/mpl-token-metadata';
import { PublicKey, Connection, Transaction } from '@solana/web3.js';

// Token Metadata Program ID (Fixed)
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

/**
 * Finds the Metadata PDA (Program Derived Address) for a given Mint Address
 */
export function findMetadataAddress(mint: PublicKey): PublicKey {
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  return metadataPDA;
}

/**
 * Creates metadata for a given token using the Metaplex SDK.
 */
export async function createTokenMetadata(
  connection: Connection,
  wallet: any,
  mintAddress: string,
  metadataUri: string,
  name: string,
  symbol: string,
  creatorAddress?: string
): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    // Validate and convert mint address
    let mint: PublicKey;
    try {
      mint = new PublicKey(mintAddress);
      if (!PublicKey.isOnCurve(mint.toBuffer())) {
        throw new Error('Invalid mint address (not on curve)');
      }
    } catch (error) {
      console.error('Invalid mint address:', mintAddress, error);
      return { success: false, error: `Invalid mint address: ${mintAddress}` };
    }

    // Initialize Metaplex with wallet adapter
    const metaplex = Metaplex.make(connection)
      .use(walletAdapterIdentity(wallet));

    console.log('Creating metadata for mint:', mint.toString());
    console.log('Metadata URI:', metadataUri);

    // Create metadata using fungible token methods
    const createResult = await metaplex
      .nfts()
      .createSft({
        useExistingMint: mint,
        name,
        symbol,
        uri: metadataUri,
        sellerFeeBasisPoints: 0,
        creators: creatorAddress 
          ? [{ address: new PublicKey(creatorAddress), share: 100 }]
          : [],
        isMutable: true,
        maxSupply: null
      });

    console.log('Metadata created successfully. TX:', createResult.response.signature);
    return { success: true, signature: createResult.response.signature };
  } catch (error: any) {
    console.error('Metadata creation failed:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown metadata creation error' 
    };
  }
}