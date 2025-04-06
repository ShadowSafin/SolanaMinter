import { clusterApiUrl } from '@solana/web3.js';

export const OWNER_WALLET_ADDRESS = "6ASNcMLW2rQjt11hWzh9J4TFKUVJHVXUAcyDR9JNcawh";

export const FEES = {
  BASE_FEE: 0.1,
  REVOKE_MINT: 0.1,
  REVOKE_UPDATE: 0.1,
  REVOKE_FREEZE: 0.1,
  SOCIALS_UPDATE: 0.1
};

// Network configuration
export type SolanaNetwork = "devnet" | "mainnet-beta";

// RPC Endpoints
export const RPC_ENDPOINTS: Record<SolanaNetwork, string> = {
  "devnet": "https://api.devnet.solana.com",
  "mainnet-beta": "https://api.mainnet-beta.solana.com"
};

// Create a store for the current network with localStorage persistence
let currentNetwork: SolanaNetwork = 
  (typeof window !== 'undefined' && localStorage.getItem('solanaNetwork') as SolanaNetwork) || "devnet";

export const getCurrentNetwork = () => currentNetwork;

export const setNetwork = (network: SolanaNetwork) => {
  currentNetwork = network;
  // Persist network selection
  if (typeof window !== 'undefined') {
    localStorage.setItem('solanaNetwork', network);
  }
  // Update the cluster API URL when network changes
  SOLANA_CLUSTER_API = RPC_ENDPOINTS[network];
};

// Network-dependent constants
export let SOLANA_CLUSTER_API: string = RPC_ENDPOINTS[currentNetwork];
export const SOLANA_EXPLORER_URL = "https://explorer.solana.com";
export const SOLANA_NETWORK = currentNetwork;

export type SocialPlatform = "twitter" | "telegram" | "discord" | "website" | "medium";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface CoinCreationParams {
  name: string;
  symbol: string;
  description: string;
  supply: number;
  decimals: number;
  image?: File;
  revokeMint: boolean;
  revokeUpdate: boolean;
  revokeFreeze: boolean;
  socials: SocialLink[];
  authorName: string;
  authorEmail?: string;
  includeMetadata: boolean; // Added parameter for metadata inclusion
}

export const TRANSACTION_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  FAILED: "failed"
};

export const TOKEN_CREATION_STATUS = {
  IDLE: "idle",
  CREATING: "creating",
  SUCCESS: "success",
  FAILED: "failed"
};

export const TOKEN_AUTHORITIES = {
  MINT: "mint",
  FREEZE: "freeze",
  UPDATE_METADATA: "update_metadata"
};

export const SUPPORTED_WALLETS = [
  {
    name: "Phantom",
    id: "phantom",
    icon: "/phantom.png",
    adapter: "solana"
  },
  {
    name: "Solflare",
    id: "solflare",
    icon: "/solflare.png",
    adapter: "solana"
  },
  {
    name: "Backpack",
    id: "backpack",
    icon: "/backpack.png",
    adapter: "solana"
  },
  {
    name: "Glow",
    id: "glow",
    icon: "/glow.png",
    adapter: "solana"
  }
];
