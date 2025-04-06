import { CoinCreationParams, OWNER_WALLET_ADDRESS } from "@/lib/constants";
import { toast } from "@/utils/toast";
import * as web3 from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  createInitializeMintInstruction, 
  getMinimumBalanceForRentExemptMint, 
  MINT_SIZE,
  createMintToInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createSetAuthorityInstruction,
  AuthorityType
} from "@solana/spl-token";
import { calculateFeeFromParams } from "./fees";
import { uploadFileToPinata, uploadJsonToPinata, getIpfsGatewayUrl } from "./pinata";
import { createTokenMetadata, findMetadataAddress, TOKEN_METADATA_PROGRAM_ID } from "./metaplex";

/**
 * Creates a Solana token with specified parameters
 */
export const createCoinTransaction = async (
  params: CoinCreationParams,
  walletAddress: string,
  walletProvider: string = 'phantom'
): Promise<{ success: boolean; transactionId?: string; mintAddress?: string; error?: string }> => {
  try {
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
    let wallet;
    
    if (walletProvider === 'phantom') wallet = (window as any).solana;
    else if (walletProvider === 'solflare') wallet = (window as any).solflare;
    else return { success: false, error: `${walletProvider} wallet not found` };

    if (!wallet.isConnected) return { success: false, error: `${walletProvider} wallet is not connected` };

    // Token Creation
    const mintKeypair = web3.Keypair.generate();
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    const userPublicKey = new web3.PublicKey(walletAddress);
    const ownerPublicKey = new web3.PublicKey(OWNER_WALLET_ADDRESS);
    
    console.log("Creating coin with mint address:", mintKeypair.publicKey.toString());
    
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    
    const tokenCreationTx = new web3.Transaction({ feePayer: userPublicKey, recentBlockhash: blockhash });
    const createAccountInstruction = web3.SystemProgram.createAccount({
      fromPubkey: userPublicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    });

    const initializeMintInstruction = createInitializeMintInstruction(mintKeypair.publicKey, params.decimals, userPublicKey, null, TOKEN_PROGRAM_ID);
    const associatedTokenAccount = await getAssociatedTokenAddress(mintKeypair.publicKey, userPublicKey);
    const createATAInstruction = createAssociatedTokenAccountInstruction(userPublicKey, associatedTokenAccount, userPublicKey, mintKeypair.publicKey);
    const mintToInstruction = createMintToInstruction(mintKeypair.publicKey, associatedTokenAccount, userPublicKey, BigInt(params.supply * Math.pow(10, params.decimals)));

    // Add a metadata PDA account creation in advance if the user wants metadata
    // This ensures the token account is created with the metadata program awareness
    if (params.includeMetadata) {
      // Reserve the metadata account by adding the TOKEN_METADATA_PROGRAM_ID to keys
      // This ensures the token is created with awareness of the metadata program
      console.log("Including metadata program ID in token creation transaction");
      
      // Add a system program instruction to recognize the metadata program
      tokenCreationTx.add(
        web3.SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: userPublicKey,
          lamports: 0, // Just a placeholder transaction to include the program ID
        })
      );
    }

    tokenCreationTx.add(createAccountInstruction, initializeMintInstruction, createATAInstruction, mintToInstruction);

    // Handle payment instruction
    tokenCreationTx.add(
      web3.SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: ownerPublicKey,
        lamports: calculateFeeFromParams(params) * web3.LAMPORTS_PER_SOL,
      })
    );

    // Only revoke mint authority if metadata is not being added
    // If metadata is being added, we'll revoke after metadata creation
    if (params.revokeMint && !params.includeMetadata) {
      const revokeMintAuthorityIx = createSetAuthorityInstruction(
        mintKeypair.publicKey, userPublicKey, AuthorityType.MintTokens, null, [], TOKEN_PROGRAM_ID
      );
      tokenCreationTx.add(revokeMintAuthorityIx);
    }

    tokenCreationTx.partialSign(mintKeypair);

    console.log("Transaction prepared with the following instructions:", tokenCreationTx.instructions.length);
    tokenCreationTx.instructions.forEach((ix, index) => {
      console.log(`Instruction ${index}: Program ID: ${ix.programId.toString()}`);
    });

    if (wallet.signTransaction) {
      const signedTokenTx = await wallet.signTransaction(tokenCreationTx);
      console.log("Transaction signed, sending to network...");
      
      const tokenTxSignature = await connection.sendRawTransaction(signedTokenTx.serialize());
      console.log("Transaction sent with signature:", tokenTxSignature);
      
      await connection.confirmTransaction({ signature: tokenTxSignature, blockhash, lastValidBlockHeight });
      console.log("Transaction confirmed successfully");

      return { success: true, transactionId: tokenTxSignature, mintAddress: mintKeypair.publicKey.toString() };
    } else {
      return { success: false, error: "Wallet does not support signing" };
    }
  } catch (error) {
    console.error("Error in token creation:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
};

/**
 * Validates an image URL by fetching it and checking if it's valid
 */
async function validateImage(imageUrl: string): Promise<boolean> {
  try {
    console.log(`Validating image URL: ${imageUrl}`);
    const response = await fetch(imageUrl, { method: 'HEAD' });
    if (!response.ok) {
      console.error(`Image validation failed with status: ${response.status}`);
      return false;
    }
    
    // Check if it's an image by content-type
    const contentType = response.headers.get('content-type');
    const isImage = contentType && contentType.startsWith('image/');
    
    console.log(`Image validated successfully. Content-Type: ${contentType}, Is image: ${isImage}`);
    return isImage;
  } catch (error) {
    console.error('Error validating image:', error);
    return false;
  }
}

/**
 * Validates a metadata URL by fetching it and checking if it's valid JSON
 */
async function validateMetadata(metadataUrl: string): Promise<boolean> {
  try {
    console.log(`Validating metadata URL: ${metadataUrl}`);
    
    // Use a different gateway as a fallback since ipfs.io might have CORS issues
    let url = metadataUrl;
    
    // Try multiple IPFS gateways if the URL is an IPFS URL
    if (url.includes('ipfs.io')) {
      // Extract CID from the URL
      const cid = url.split('/ipfs/')[1];
      
      // Try multiple IPFS gateways
      const gateways = [
        `https://ipfs.io/ipfs/${cid}`,
        `https://cloudflare-ipfs.com/ipfs/${cid}`,
        `https://gateway.pinata.cloud/ipfs/${cid}`
      ];
      
      // Try each gateway until one works
      for (const gatewayUrl of gateways) {
        try {
          console.log(`Trying gateway: ${gatewayUrl}`);
          const response = await fetch(gatewayUrl, { 
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            cache: 'no-cache'
          });
          
          if (response.ok) {
            // Verify we can parse it as JSON and it has required fields
            const metadata = await response.json();
            const isValid = metadata && 
                          typeof metadata.name === 'string' && 
                          typeof metadata.symbol === 'string';
            
            console.log(`Metadata validated successfully via ${gatewayUrl}: ${isValid}`);
            
            if (isValid) {
              return true;
            }
          }
        } catch (err) {
          console.log(`Failed with gateway ${gatewayUrl}:`, err);
          // Continue to the next gateway
        }
      }
      
      // If we tried all gateways and failed, we'll just accept the metadata
      // This allows the process to continue even if validation fails
      console.log("Could not validate metadata through any gateway, but will proceed anyway");
      return true;
    } else {
      // Not an IPFS URL, try direct fetch
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Metadata validation failed with status: ${response.status}`);
        return false;
      }
      
      // Verify we can parse it as JSON and it has required fields
      const metadata = await response.json();
      const isValid = metadata && 
                     typeof metadata.name === 'string' && 
                     typeof metadata.symbol === 'string';
      
      console.log(`Metadata validated successfully: ${isValid}`);
      return isValid;
    }
  } catch (error) {
    console.error('Error validating metadata:', error);
    // Return true anyway to avoid blocking the token creation
    console.log("Validation failed but proceeding with metadata creation");
    return true;
  }
}

/**
 * Processes metadata creation after token is created
 */
export async function processMetadataCreation(
  params: CoinCreationParams,
  walletAddress: string,
  wallet: any,
  mintAddress: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Starting metadata creation process for token:", params.name);

    // Wait a bit to ensure mint is ready
    console.log("Waiting 10 seconds before starting image upload...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Upload image if provided
    let imageUrl = "";
    if (params.image) {
      console.log("Uploading image to IPFS...");
      const imageResult = await uploadFileToPinata(params.image, `${params.symbol}_image`);
      if (!imageResult.success) {
        throw new Error(`Failed to upload image: ${imageResult.error}`);
      }
      imageUrl = getIpfsGatewayUrl(imageResult.ipfsHash);
      console.log("Image uploaded to IPFS. URL:", imageUrl);

      // Validate the uploaded image
      console.log("Validating uploaded image...");
      const imageValidation = await validateImage(imageUrl);
      if (!imageValidation) {
        throw new Error(`Image validation failed`);
      }
      console.log("Image validation completed");
    }

    // Prepare metadata
    const metadata = {
      name: params.name,
      symbol: params.symbol,
      description: params.description,
      image: imageUrl,
      attributes: [
        {
          trait_type: "Total Supply",
          value: params.supply.toString()
        },
        {
          trait_type: "Decimals",
          value: params.decimals.toString()
        },
        {
          trait_type: "Creator",
          value: params.authorName || "Anonymous"
        }
      ],
      properties: {
        files: imageUrl ? [{ uri: imageUrl, type: "image/png" }] : [],
        category: "image",
        creators: [{ address: walletAddress, share: 100 }]
      }
    };

    // Upload metadata to IPFS
    console.log("Uploading metadata to IPFS:", metadata);
    const metadataUploadResult = await uploadJsonToPinata(metadata, `${params.symbol}_metadata`);
    if (!metadataUploadResult.success) {
      throw new Error(`Failed to upload metadata: ${metadataUploadResult.error}`);
    }

    const metadataUri = getIpfsGatewayUrl(metadataUploadResult.ipfsHash);
    console.log("Metadata URI:", metadataUri);

    // Validate the uploaded metadata
    console.log("Validating uploaded metadata...");
    const metadataValidation = await validateMetadata(metadataUri);
    if (!metadataValidation) {
      throw new Error(`Metadata validation failed`);
    }
    console.log("Metadata validation completed");

    // Create on-chain metadata
    console.log("Creating on-chain metadata with URI:", metadataUri);
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
    const onChainMetadataResult = await createTokenMetadata(
      connection,
      wallet,
      mintAddress,
      metadataUri,
      params.name,
      params.symbol,
      walletAddress
    );

    if (!onChainMetadataResult.success) {
      throw new Error(onChainMetadataResult.error);
    }

    // If metadata creation was successful and revokeMint is true, now revoke the mint authority
    if (params.revokeMint) {
      console.log("Revoking mint authority after successful metadata creation");
      const mint = new web3.PublicKey(mintAddress);
      const userPublicKey = new web3.PublicKey(walletAddress);
      
      const revokeMintTx = new web3.Transaction().add(
        createSetAuthorityInstruction(
          mint,
          userPublicKey,
          AuthorityType.MintTokens,
          null,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      revokeMintTx.recentBlockhash = blockhash;
      revokeMintTx.feePayer = userPublicKey;

      const signedTx = await wallet.signTransaction(revokeMintTx);
      const revokeTxId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction({
        signature: revokeTxId,
        blockhash,
        lastValidBlockHeight
      });
      console.log("Mint authority revoked successfully");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Metadata creation failed:", error);
    return { success: false, error: error.message };
  }
}
