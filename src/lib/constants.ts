
export const OWNER_WALLET_ADDRESS = "6ASNcMLW2rQjt11hWzh9J4TFKUVJHVXUAcyDR9JNcawh";

export const FEES = {
  BASE_FEE: 0.1,
  REVOKE_MINT: 0.1,
  REVOKE_UPDATE: 0.1,
  REVOKE_FREEZE: 0.1,
  SOCIALS_UPDATE: 0.1
};

// Ensure we're using devnet
export const SOLANA_NETWORK = "devnet" as const;
export const SOLANA_CLUSTER_API = "https://api.devnet.solana.com";
export const SOLANA_EXPLORER_URL = "https://explorer.solana.com";

export type SolanaNetwork = "devnet" | "mainnet-beta";

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
    icon: "https://www.phantom.app/img/phantom-logo.svg",
    adapter: "solana"
  },
  {
    name: "Solflare",
    id: "solflare",
    icon: "https://solflare.com/assets/solflare-wallet-logo.svg",
    adapter: "solana"
  },
  {
    name: "Backpack",
    id: "backpack",
    icon: "https://backpack.app/assets/favicon/favicon.ico",
    adapter: "solana"
  },
  {
    name: "Glow",
    id: "glow",
    icon: "https://glow.app/favicon.ico",
    adapter: "solana"
  }
];
