import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "./WalletConnect";
import { ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <a href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-solana to-solana-dark flex items-center justify-center text-white">
              S
            </div>
            <span className="hidden md:block animate-fade-in">SolanaMinter</span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
          <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <WalletConnect />
          
          <Button 
            variant="default" 
            size="sm" 
            className="hidden md:flex items-center gap-1 bg-gradient-to-r from-solana to-solana-dark hover:opacity-90 transition-opacity"
            onClick={() => window.location.href = "#create-coin"}
          >
            Start Creating <ChevronRight className="h-4 w-4" />
          </Button>
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
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
