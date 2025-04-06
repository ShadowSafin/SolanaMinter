import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "./WalletConnect";
import { NetworkSelector } from "./NetworkSelector";
import { ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-2">
          <img src="/logo.svg" alt="Solana Meme Token Minter" className="h-8 w-8" />
          <span className="hidden font-bold sm:inline-block">
            Solana Meme Token Minter
          </span>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <NetworkSelector />
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}

export default Header;
