import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Coins, CheckCircle, Copy, ExternalLink } from "lucide-react";
import { toast } from "@/utils/toast";
import { SOLANA_EXPLORER_URL, SOLANA_NETWORK, type SocialLink } from "@/lib/constants";

interface CreatedCoinDisplayProps {
  visible: boolean;
  name: string;
  symbol: string;
  supply: number;
  decimals: number;
  mintAddress: string;
  transactionId: string;
  socials?: SocialLink[];
  image?: string;
  hasMetadata?: boolean;
  onClose: () => void;
}

export function CreatedCoinDisplay({
  visible,
  name,
  symbol,
  supply,
  decimals,
  mintAddress,
  transactionId,
  socials = [],
  image,
  hasMetadata = true,
  onClose
}: CreatedCoinDisplayProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
      toast.success(`${label} copied to clipboard`);
    });
  };

  const getExplorerUrl = (address: string, type: 'tx' | 'address') => {
    const baseUrl = SOLANA_EXPLORER_URL;
    const network = SOLANA_NETWORK === 'devnet' ? `?cluster=${SOLANA_NETWORK}` : '';
    
    return `${baseUrl}/${type}/${address}${network}`;
  };

  if (!visible) return null;

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto bg-green-100 dark:bg-green-900 rounded-full w-12 h-12 flex items-center justify-center mb-2">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-xl">Coin Created Successfully!</DialogTitle>
          <DialogDescription>
            Your {name} ({symbol}) token has been created on the Solana {SOLANA_NETWORK}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {image && (
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full overflow-hidden">
                <img src={image} alt={name} className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Token Name:</span>
              <span className="text-sm">{name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Symbol:</span>
              <span className="text-sm">{symbol}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Supply:</span>
              <span className="text-sm">{supply.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Decimals:</span>
              <span className="text-sm">{decimals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Metadata:</span>
              <span className="text-sm">{hasMetadata ? "Yes" : "No"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Token Address:</span>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => copyToClipboard(mintAddress, "Token address")}
                >
                  {copied === "Token address" ? <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
                <a
                  href={getExplorerUrl(mintAddress, 'address')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:text-primary/90 flex items-center"
                >
                  View <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
            <div className="bg-muted p-2 rounded">
              <code className="text-xs break-all">{mintAddress}</code>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Transaction ID:</span>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => copyToClipboard(transactionId, "Transaction ID")}
                >
                  {copied === "Transaction ID" ? <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
                <a
                  href={getExplorerUrl(transactionId, 'tx')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:text-primary/90 flex items-center"
                >
                  View <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
            <div className="bg-muted p-2 rounded">
              <code className="text-xs break-all">{transactionId}</code>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button className="flex-1 bg-solana hover:bg-solana-dark" onClick={() => window.location.reload()}>
            <Coins className="h-4 w-4 mr-2" />
            Create Another Coin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreatedCoinDisplay;
