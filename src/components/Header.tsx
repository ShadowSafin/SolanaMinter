import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "./WalletConnect";
import { NetworkSelector } from "./NetworkSelector";
import { ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { Link } from "react-router-dom";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <img src="/solana.png" alt="Solana Logo" className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              SolanaMinter
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Home
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <NetworkSelector />
          </div>
          <nav className="flex items-center">
            <WalletConnect />
            <ThemeToggle />
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={cn(
          "fixed inset-0 top-16 z-50 bg-background md:hidden transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="flex flex-col gap-4 p-6">
          <a 
            href="#features" 
            className="text-lg py-2 border-b border-border"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            className="text-lg py-2 border-b border-border"
            onClick={() => setMobileMenuOpen(false)}
          >
            How It Works
          </a>
          <a 
            href="#pricing" 
            className="text-lg py-2 border-b border-border"
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </a>
          <a 
            href="#faq" 
            className="text-lg py-2 border-b border-border"
            onClick={() => setMobileMenuOpen(false)}
          >
            FAQ
          </a>
          <div className="flex items-center gap-4 py-4 border-t border-border">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">Toggle theme</span>
          </div>
          <Button 
            variant="default" 
            className="mt-4 bg-gradient-to-r from-solana to-solana-dark hover:opacity-90 transition-opacity"
            onClick={() => {
              window.location.href = "#create-coin";
              setMobileMenuOpen(false);
            }}
          >
            Start Creating <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
