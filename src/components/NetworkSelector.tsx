import { Button } from "@/components/ui/button";
import { getCurrentNetwork, setNetwork, type SolanaNetwork } from "@/lib/constants";
import { Network, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Connection } from "@solana/web3.js";
import { toast } from "@/utils/toast";

export function NetworkSelector() {
  const [network, setCurrentNetwork] = useState<SolanaNetwork>(getCurrentNetwork());
  const [isChanging, setIsChanging] = useState(false);

  const handleNetworkChange = async (newNetwork: SolanaNetwork) => {
    if (newNetwork === network) return;
    
    setIsChanging(true);
    try {
      // Update network state immediately
      setNetwork(newNetwork);
      setCurrentNetwork(newNetwork);
      
      toast.success(
        `Switched to ${newNetwork === "devnet" ? "Devnet" : "Mainnet"}`,
        { description: "Network connection updated successfully" }
      );

      // Delay reload to allow toast to show
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error("Failed to switch networks:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Could not switch networks. Please try again in a few moments.";
      
      toast.error(
        "Network switch failed",
        { description: errorMessage }
      );
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={isChanging}>
          {isChanging ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Network className="h-4 w-4" />
          )}
          {network === "devnet" ? "Devnet" : "Mainnet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleNetworkChange("devnet")}
          className={network === "devnet" ? "bg-accent" : ""}
          disabled={isChanging || network === "devnet"}
        >
          Devnet
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleNetworkChange("mainnet-beta")}
          className={network === "mainnet-beta" ? "bg-accent" : ""}
          disabled={isChanging || network === "mainnet-beta"}
        >
          Mainnet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 