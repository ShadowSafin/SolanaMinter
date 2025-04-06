
import { Github, Heart, Twitter } from "lucide-react";
import { OWNER_WALLET_ADDRESS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-6 md:py-0">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-24">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-solana flex items-center justify-center text-white text-xs">
              S
            </div>
            <span className="font-semibold text-sm">SolanaMinter</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Create custom Solana memecoins easily
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-2 md:gap-4 md:flex-row">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </a>
          <div className="flex items-center gap-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </a>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground flex flex-col items-center md:items-end">
          <div className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500" /> for Solana
          </div>
          <div className="mt-1 text-xxs text-muted-foreground/70 text-center md:text-right">
            Creator wallet: {OWNER_WALLET_ADDRESS.slice(0, 4)}...{OWNER_WALLET_ADDRESS.slice(-4)}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
