
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SOLANA_EXPLORER_URL, SOLANA_NETWORK } from "@/lib/constants";

interface CreatedCoin {
  name: string;
  symbol: string;
  supply: number;
  mintAddress: string;
  transactionId: string;
  createdAt: string;
}

export function CreatedCoinsList() {
  const [coins, setCoins] = useState<CreatedCoin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load coins from localStorage
    const loadCoins = () => {
      const savedCoins = localStorage.getItem('createdCoins');
      if (savedCoins) {
        try {
          setCoins(JSON.parse(savedCoins));
        } catch (e) {
          console.error("Error parsing saved coins", e);
          setCoins([]);
        }
      }
      setLoading(false);
    };

    loadCoins();
  }, []);

  const getExplorerUrl = (address: string, type: 'tx' | 'address') => {
    const baseUrl = SOLANA_EXPLORER_URL;
    const network = SOLANA_NETWORK === 'devnet' ? `?cluster=${SOLANA_NETWORK}` : '';
    
    return `${baseUrl}/${type}/${address}${network}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Created Coins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-6">
            <div className="animate-pulse">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (coins.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Created Coins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 text-muted-foreground">
            <p>You haven't created any coins yet.</p>
            <Button 
              className="mt-4 bg-solana hover:bg-solana-dark"
              onClick={() => window.location.href = "#create-coin"}
            >
              Create Your First Coin
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Created Coins</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Supply</TableHead>
                <TableHead>Token Address</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coins.map((coin) => (
                <TableRow key={coin.mintAddress}>
                  <TableCell className="font-medium">{coin.name}</TableCell>
                  <TableCell>{coin.symbol}</TableCell>
                  <TableCell>{coin.supply.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-[150px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="cursor-default">
                          {coin.mintAddress.slice(0, 6)}...{coin.mintAddress.slice(-4)}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-mono text-xs">{coin.mintAddress}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>{new Date(coin.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <a
                        href={getExplorerUrl(coin.mintAddress, 'address')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center justify-center rounded-md bg-muted px-3 text-xs font-medium transition-colors hover:bg-muted/80"
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Explorer
                      </a>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <Info className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Transaction ID: {coin.transactionId.slice(0, 8)}...</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreatedCoinsList;
