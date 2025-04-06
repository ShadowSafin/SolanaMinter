
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Loader2, ChevronDown, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "@/utils/toast";
import { 
  connectWallet, 
  disconnectWallet, 
  getWalletBalance, 
  requestAirdrop, 
  detectWallets 
} from "@/utils/solana";
import { SOLANA_NETWORK, SUPPORTED_WALLETS } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function WalletConnect() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletProvider, setWalletProvider] = useState("phantom");
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState<string[]>([]);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  
  useEffect(() => {
    // Detect available wallets
    const wallets = detectWallets();
    setDetectedWallets(wallets);
    
    // Check if wallet is already connected on component mount
    const checkWalletConnection = async () => {
      // Try to check each wallet type
      for (const walletId of wallets) {
        try {
          let isConnected = false;
          let publicKey;
          
          if (walletId === 'phantom' && (window as any).solana?.isPhantom) {
            const phantom = (window as any).solana;
            isConnected = phantom.isConnected;
            publicKey = phantom.publicKey?.toString();
          } else if (walletId === 'solflare' && (window as any).solflare) {
            const solflare = (window as any).solflare;
            isConnected = solflare.isConnected;
            publicKey = solflare.publicKey?.toString();
          } else if (walletId === 'backpack' && (window as any).backpack) {
            const backpack = (window as any).backpack;
            isConnected = backpack.isConnected;
            publicKey = backpack.publicKey?.toString();
          } else if (walletId === 'glow' && (window as any).glowSolana) {
            const glow = (window as any).glowSolana;
            isConnected = glow.isConnected;
            publicKey = glow.publicKey?.toString();
          }
          
          if (isConnected && publicKey) {
            setWalletAddress(publicKey);
            setWalletProvider(walletId);
            setConnected(true);
            
            // Get balance
            const walletBalance = await getWalletBalance(publicKey);
            setBalance(walletBalance);
            
            // We found a connected wallet, no need to check others
            break;
          }
        } catch (err) {
          console.error(`Error checking ${walletId} wallet connection:`, err);
        }
      }
    };
    
    checkWalletConnection();
    
    // Setup wallet event listeners
    const setupWalletListeners = () => {
      const phantom = (window as any).solana;
      const solflare = (window as any).solflare;
      const backpack = (window as any).backpack;
      const glow = (window as any).glowSolana;
      
      const handleDisconnect = () => {
        setConnected(false);
        setWalletAddress("");
        setBalance(null);
        toast.info("Wallet disconnected");
      };
      
      const handleAccountChange = async () => {
        checkWalletConnection();
      };
      
      if (phantom) {
        phantom.on('disconnect', handleDisconnect);
        phantom.on('accountChanged', handleAccountChange);
      }
      
      if (solflare) {
        solflare.on('disconnect', handleDisconnect);
      }
      
      return () => {
        if (phantom) {
          phantom.removeListener('disconnect', handleDisconnect);
          phantom.removeListener('accountChanged', handleAccountChange);
        }
        
        if (solflare) {
          solflare.removeListener('disconnect', handleDisconnect);
        }
      };
    };
    
    const cleanup = setupWalletListeners();
    return cleanup;
  }, []);
  
  const handleConnectWallet = async (walletId: string = 'phantom') => {
    setIsLoading(true);
    setConnectionFailed(false);
    setConnectionError("");
    
    try {
      const walletInfo = await connectWallet(walletId);
      
      if (walletInfo.status === "connected" && walletInfo.address) {
        setWalletAddress(walletInfo.address);
        setBalance(walletInfo.balance);
        setConnected(true);
        setWalletProvider(walletInfo.walletProvider || walletId);
      } else if (walletInfo.error) {
        setConnectionFailed(true);
        setConnectionError(walletInfo.error);
        setShowErrorDialog(true);
        
        toast.error("Connection failed", { 
          description: walletInfo.error 
        });
      }
    } catch (error) {
      console.error(`Error connecting to ${walletId} wallet:`, error);
      
      setConnectionFailed(true);
      const errorMessage = error instanceof Error ? error.message : `Could not connect to ${walletId} wallet`;
      setConnectionError(errorMessage);
      setShowErrorDialog(true);
      
      toast.error("Connection failed", { 
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDisconnectWallet = async () => {
    setIsLoading(true);
    try {
      await disconnectWallet(walletProvider);
      setConnected(false);
      setWalletAddress("");
      setBalance(null);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRequestAirdrop = async () => {
    if (!connected || !walletAddress) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to request an airdrop"
      });
      return;
    }
    
    if (SOLANA_NETWORK !== 'devnet') {
      toast.error("Network not supported", {
        description: "Airdrops are only available on devnet"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await requestAirdrop(walletAddress);
      if (result) {
        // Update balance after airdrop
        const newBalance = await getWalletBalance(walletAddress);
        setBalance(newBalance);
      }
    } catch (error) {
      console.error("Error requesting airdrop:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getWalletIcon = (walletId: string) => {
    const wallet = SUPPORTED_WALLETS.find(w => w.id === walletId);
    return wallet?.icon || null;
  };
  
  const refreshBalance = async () => {
    if (connected && walletAddress) {
      setIsLoading(true);
      try {
        const newBalance = await getWalletBalance(walletAddress);
        setBalance(newBalance);
        toast.success("Balance updated", {
          description: `Current balance: ${newBalance.toFixed(4)} SOL`
        });
      } catch (error) {
        console.error("Error refreshing balance:", error);
        toast.error("Failed to refresh balance", {
          description: "Could not get the latest balance"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const retryConnection = () => {
    setShowErrorDialog(false);
    handleConnectWallet(walletProvider);
  };
  
  return (
    <div className="flex items-center gap-2">
      {SOLANA_NETWORK === 'devnet' && connected && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRequestAirdrop}
          disabled={isLoading}
          className="mr-2"
        >
          Get Devnet SOL
        </Button>
      )}
      
      {!connected ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
              disabled={isLoading || detectedWallets.length === 0}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : connectionFailed ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : (
                <Wallet className="h-4 w-4" />
              )}
              {connectionFailed ? "Retry Connection" : "Connect Wallet"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SUPPORTED_WALLETS.map((wallet) => (
              <DropdownMenuItem
                key={wallet.id}
                onClick={() => handleConnectWallet(wallet.id)}
                disabled={!detectedWallets.includes(wallet.id)}
                className={!detectedWallets.includes(wallet.id) ? "opacity-50" : ""}
              >
                <div className="flex items-center gap-2">
                  {wallet.icon && (
                    <img src={wallet.icon} alt={wallet.name} className="w-4 h-4" />
                  )}
                  <span>{wallet.name}</span>
                  {!detectedWallets.includes(wallet.id) && (
                    <span className="text-xs text-muted-foreground">(Not installed)</span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshBalance}
            className="px-2"
            title="Refresh balance"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnectWallet}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {getWalletIcon(walletProvider) ? (
                  <img 
                    src={getWalletIcon(walletProvider) || ''} 
                    alt={walletProvider} 
                    className="h-4 w-4" 
                  />
                ) : (
                  <Wallet className="h-4 w-4" />
                )}
                {`${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)} ${balance ? `(${balance.toFixed(2)} SOL)` : ''}`}
              </>
            )}
          </Button>
        </div>
      )}
      
      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Wallet Connection Failed</AlertDialogTitle>
            <AlertDialogDescription>
              {connectionError || "There was an error connecting to your wallet."}
              <br/><br/>
              Possible solutions:
              <ul className="list-disc pl-5 mt-2">
                <li>Make sure your wallet extension is installed and unlocked</li>
                <li>Refresh the page and try again</li>
                <li>Check if your wallet supports the Solana {SOLANA_NETWORK} network</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={retryConnection}>Try Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default WalletConnect;
