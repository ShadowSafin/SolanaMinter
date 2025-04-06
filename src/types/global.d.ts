
interface Window {
  solana?: {
    isPhantom: boolean;
    isConnected: boolean;
    publicKey: {
      toString: () => string;
    };
    connect: () => Promise<{
      publicKey: {
        toString: () => string;
      };
    }>;
    disconnect: () => Promise<void>;
    signTransaction: (transaction: any) => Promise<any>;
    signAllTransactions: (transactions: any[]) => Promise<any[]>;
    signMessage: (message: Uint8Array) => Promise<{
      signature: Uint8Array;
      publicKey: {
        toString: () => string;
      };
    }>;
  };
  solflare?: {
    isConnected: boolean;
    publicKey: {
      toString: () => string;
    };
    connect: () => Promise<{
      publicKey: {
        toString: () => string;
      };
    }>;
    disconnect: () => Promise<void>;
    signTransaction: (transaction: any) => Promise<any>;
    signAllTransactions: (transactions: any[]) => Promise<any[]>;
    signMessage: (message: Uint8Array) => Promise<{
      signature: Uint8Array;
      publicKey: {
        toString: () => string;
      };
    }>;
  };
  backpack?: {
    isConnected: boolean;
    publicKey: {
      toString: () => string;
    };
    connect: () => Promise<{
      publicKey: {
        toString: () => string;
      };
    }>;
    disconnect: () => Promise<void>;
    signTransaction: (transaction: any) => Promise<any>;
    signAllTransactions: (transactions: any[]) => Promise<any[]>;
    signMessage: (message: Uint8Array) => Promise<{
      signature: Uint8Array;
      publicKey: {
        toString: () => string;
      };
    }>;
  };
  glowSolana?: {
    isConnected: boolean;
    publicKey: {
      toString: () => string;
    };
    connect: () => Promise<{
      publicKey: {
        toString: () => string;
      };
    }>;
    disconnect: () => Promise<void>;
    signTransaction: (transaction: any) => Promise<any>;
    signAllTransactions: (transactions: any[]) => Promise<any[]>;
    signMessage: (message: Uint8Array) => Promise<{
      signature: Uint8Array;
      publicKey: {
        toString: () => string;
      };
    }>;
  };
}
