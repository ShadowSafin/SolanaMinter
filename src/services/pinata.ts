
const PINATA_API_KEY = "4fa22fd8c5d03ae2862c";
const PINATA_SECRET_KEY = "68ebd03acb08c733009a23331bc5b05901389c50a624199f9f5c6f9d2ac016c4";
const PINATA_API_URL = "https://api.pinata.cloud/pinning";

/**
 * Uploads a file to IPFS via Pinata
 */
export const uploadFileToPinata = async (
  file: File,
  name: string
): Promise<{ success: boolean; ipfsHash?: string; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const metadata = JSON.stringify({ name });
    formData.append('pinataMetadata', metadata);

    const pinataOptions = JSON.stringify({ cidVersion: 1 });
    formData.append('pinataOptions', pinataOptions);

    const response = await fetch(`${PINATA_API_URL}/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error uploading to IPFS');
    
    return { success: true, ipfsHash: data.IpfsHash };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Uploads JSON metadata to IPFS via Pinata
 */
export const uploadJsonToPinata = async (
  jsonData: object,
  name: string
): Promise<{ success: boolean; ipfsHash?: string; error?: string }> => {
  try {
    const data = JSON.stringify({
      pinataContent: jsonData,
      pinataMetadata: { name },
      pinataOptions: { cidVersion: 1 }
    });

    const response = await fetch(`${PINATA_API_URL}/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: data,
    });

    const responseData = await response.json();
    if (!response.ok) throw new Error(responseData.error || 'Error uploading JSON to IPFS');
    
    return { success: true, ipfsHash: responseData.IpfsHash };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Generates the IPFS gateway URL from IPFS hash
 * Uses Pinata gateway which is more reliable
 */
export const getIpfsGatewayUrl = (ipfsHash: string): string => {
  // Use the Pinata gateway instead of ipfs.io as it's generally more reliable
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
};
