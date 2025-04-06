import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleDollarSign, Info, Loader2, LockIcon, Coins, Globe, ChevronRight, Check, Image as ImageIcon, Trash2, ArrowRightIcon, Wallet } from "lucide-react";
import { toast } from "@/utils/toast";
import { calculateTotalFee, createCoin } from "@/utils/solana";
import { FEES, OWNER_WALLET_ADDRESS, SocialPlatform, type CoinCreationParams } from "@/lib/constants";
import { cn } from "@/lib/utils";
import CreatedCoinDisplay from "./CreatedCoinDisplay";

export function CoinCreator() {
  const [activeTab, setActiveTab] = useState("basics");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // New state for created coin
  const [createdCoin, setCreatedCoin] = useState<{
    visible: boolean;
    name: string;
    symbol: string;
    supply: number;
    decimals: number;
    mintAddress: string;
    transactionId: string;
    socials: any[];
    image?: string;
  }>({
    visible: false,
    name: "",
    symbol: "",
    supply: 0,
    decimals: 0,
    mintAddress: "",
    transactionId: "",
    socials: []
  });

  // Add toggles for socials and creator info
  const [includeSocials, setIncludeSocials] = useState(false);
  const [includeCreatorInfo, setIncludeCreatorInfo] = useState(false);

  const [formData, setFormData] = useState<CoinCreationParams>({
    name: "",
    symbol: "",
    description: "",
    supply: 1000000000,
    decimals: 9,
    revokeMint: false,
    revokeUpdate: false,
    revokeFreeze: false,
    socials: [],
    authorName: "",
    includeMetadata: true, // Default to including metadata
  });

  const [socialInputs, setSocialInputs] = useState({
    twitter: "",
    telegram: "",
    discord: "",
    website: "",
    medium: ""
  });

  const totalFee = calculateTotalFee(formData);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large", { description: "Please upload an image smaller than 5MB" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setFormData(prev => ({ ...prev, image: file }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => {
      const newData = { ...prev };
      delete newData.image;
      return newData;
    });
  };

  const handleSocialChange = (platform: string, value: string) => {
    setSocialInputs(prev => ({ ...prev, [platform]: value }));
  };

  const addSocial = (platform: SocialPlatform) => {
    const url = socialInputs[platform];
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error("Invalid URL", { description: "Please enter a valid URL starting with http:// or https://" });
      return;
    }

    setFormData(prev => ({
      ...prev,
      socials: [...prev.socials.filter(s => s.platform !== platform), { platform, url }]
    }));

    setSocialInputs(prev => ({ ...prev, [platform]: "" }));

    toast.success("Social link added", { description: `Added ${platform} link` });
  };

  const removeSocial = (platform: SocialPlatform) => {
    setFormData(prev => ({
      ...prev,
      socials: prev.socials.filter(s => s.platform !== platform)
    }));
    toast.success("Social link removed");
  };

  const handleSupplyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setFormData(prev => ({ ...prev, supply: value }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Name required", { description: "Please enter a name for your coin" });
      setActiveTab("basics");
      return;
    }

    if (!formData.symbol) {
      toast.error("Symbol required", { description: "Please enter a symbol for your coin" });
      setActiveTab("basics");
      return;
    }

    // Check all available wallet providers
    const phantom = (window as any)?.solana;
    const solflare = (window as any)?.solflare;
    const backpack = (window as any)?.backpack;
    const glow = (window as any)?.glowSolana;
    
    let walletProvider = '';
    let wallet = null;
    let walletAddress = '';
    
    // Find the first connected wallet
    if (phantom && phantom.isConnected && phantom.publicKey) {
      wallet = phantom;
      walletProvider = 'phantom';
      walletAddress = phantom.publicKey.toString();
    } else if (solflare && solflare.isConnected && solflare.publicKey) {
      wallet = solflare;
      walletProvider = 'solflare';
      walletAddress = solflare.publicKey.toString();
    } else if (backpack && backpack.isConnected && backpack.publicKey) {
      wallet = backpack;
      walletProvider = 'backpack';
      walletAddress = backpack.publicKey.toString();
    } else if (glow && glow.isConnected && glow.publicKey) {
      wallet = glow;
      walletProvider = 'glow';
      walletAddress = glow.publicKey.toString();
    }
    
    if (!wallet || !walletAddress) {
      toast.error("Wallet not connected", { 
        description: "Please connect your wallet to continue" 
      });
      return;
    }

    // If socials toggle is off, clear socials array
    if (!includeSocials) {
      setFormData(prev => ({ ...prev, socials: [] }));
    }

    // If creator info toggle is off, set default values
    if (!includeCreatorInfo) {
      setFormData(prev => ({ 
        ...prev, 
        authorName: "SolanaMinter",
        authorEmail: "contact@solanaminter.com"
      }));
    }

    try {
      setIsSubmitting(true);
      
      toast.info("Preparing transaction", {
        description: "Please keep your wallet open to sign the transaction",
        duration: 10000,
      });
      
      const result = await createCoin(formData, walletAddress, walletProvider);
      
      if (result.success) {
        toast.success("Coin created successfully!", { 
          description: `Transaction ID: ${result.transactionId?.slice(0, 8)}...` 
        });
        
        // Save the created coin to localStorage
        const newCoin = {
          name: formData.name,
          symbol: formData.symbol,
          supply: formData.supply,
          decimals: formData.decimals,
          mintAddress: result.mintAddress || "Unknown", // This should be returned by the createCoin function
          transactionId: result.transactionId || "Unknown",
          socials: formData.socials,
          createdAt: new Date().toISOString(),
          hasMetadata: formData.includeMetadata
        };
        
        // Save to localStorage
        const savedCoins = localStorage.getItem('createdCoins');
        let coinsArray = [];
        if (savedCoins) {
          try {
            coinsArray = JSON.parse(savedCoins);
          } catch (e) {
            console.error("Error parsing saved coins", e);
          }
        }
        coinsArray.unshift(newCoin);
        localStorage.setItem('createdCoins', JSON.stringify(coinsArray));
        
        // Show the created coin modal
        setCreatedCoin({
          visible: true,
          name: formData.name,
          symbol: formData.symbol,
          supply: formData.supply,
          decimals: formData.decimals,
          mintAddress: result.mintAddress || "Unknown",
          transactionId: result.transactionId || "Unknown",
          socials: formData.socials,
          image: imagePreview || undefined
        });
        
        // Reset form after successful creation
        setFormData({
          name: "",
          symbol: "",
          description: "",
          supply: 1000000000,
          decimals: 9,
          revokeMint: false,
          revokeUpdate: false,
          revokeFreeze: false,
          socials: [],
          authorName: "",
          includeMetadata: true,
        });
        setSocialInputs({
          twitter: "",
          telegram: "",
          discord: "",
          website: "",
          medium: ""
        });
        setImagePreview(null);
        setActiveTab("basics");
        setIncludeSocials(false);
        setIncludeCreatorInfo(false);
      } else {
        const errorMessage = result.error || "Unknown error occurred";
        
        // Improved error messaging
        if (errorMessage.includes("timeout")) {
          toast.error("Transaction timed out", { 
            description: "Please try again and confirm in your wallet promptly" 
          });
        } else if (errorMessage.includes("rejected")) {
          toast.error("Transaction rejected", { 
            description: "You rejected the transaction in your wallet" 
          });
        } else if (errorMessage.includes("disconnected")) {
          toast.error("Wallet disconnected", { 
            description: "Your wallet was disconnected. Please reconnect and try again." 
          });
        } else {
          toast.error("Failed to create coin", { 
            description: errorMessage
          });
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = error instanceof Error ? error.message : "Please try again";
      
      if (errorMessage.includes("timeout")) {
        toast.error("Transaction timed out", { 
          description: "Please try again and confirm in your wallet promptly" 
        });
      } else {
        toast.error("Transaction failed", { 
          description: errorMessage
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToNextTab = () => {
    if (activeTab === "basics") setActiveTab("permissions");
    else if (activeTab === "permissions") setActiveTab("socials");
    else if (activeTab === "socials") setActiveTab("review");
  };

  const goToPrevTab = () => {
    if (activeTab === "review") setActiveTab("socials");
    else if (activeTab === "socials") setActiveTab("permissions");
    else if (activeTab === "permissions") setActiveTab("basics");
  };

  const handleCloseCreatedCoin = () => {
    setCreatedCoin(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto" id="create-coin">
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-solana" />
            Create Your Solana Memecoin
          </CardTitle>
          <CardDescription>
            Fill out the form below to create your custom Solana memecoin. Fees will be processed via your connected wallet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="basics" className="relative">
                Basics
                {activeTab !== "basics" && formData.name && formData.symbol && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </TabsTrigger>
              <TabsTrigger value="permissions">
                Permissions
              </TabsTrigger>
              <TabsTrigger value="socials">
                Socials
              </TabsTrigger>
              <TabsTrigger value="review">
                Review
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basics" className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Coin Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Solana Doge" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Symbol (Ticker)</Label>
                    <Input 
                      id="symbol" 
                      placeholder="e.g. SOLDOGE" 
                      value={formData.symbol}
                      onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                      className="uppercase"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe your memecoin" 
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="resize-none h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supply">Total Supply</Label>
                  <Input 
                    id="supply" 
                    type="number" 
                    placeholder="1000000000"
                    min="1000"
                    value={formData.supply}
                    onChange={handleSupplyChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1,000,000,000 (1 billion)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Decimals: {formData.decimals}</Label>
                  <Slider 
                    value={[formData.decimals]} 
                    min={0} 
                    max={9} 
                    step={1}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, decimals: value[0] }))} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Most Solana tokens use 9 decimals. Lower values are less divisible.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Upload Coin Image (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/50 flex items-center justify-center overflow-hidden",
                      imagePreview ? "border-none" : ""
                    )}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {!imagePreview ? (
                        <Button variant="outline" onClick={() => document.getElementById("image-upload")?.click()}>
                          Select Image
                        </Button>
                      ) : (
                        <Button variant="outline" className="text-destructive" onClick={removeImage}>
                          <Trash2 className="h-4 w-4 mr-2" /> Remove
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Square JPG or PNG, max 5MB
                      </p>
                      <input 
                        type="file" 
                        id="image-upload" 
                        className="hidden" 
                        accept="image/png,image/jpeg"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch 
                    id="includeMetadata" 
                    checked={formData.includeMetadata}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeMetadata: checked }))}
                  />
                  <Label htmlFor="includeMetadata">Include token metadata</Label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={goToNextTab} className="bg-solana hover:bg-solana-dark">
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6 animate-fade-in">
              <div className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                    <Info className="h-4 w-4" />
                    Permission Settings
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    These settings control what permissions you as the creator will have after token creation. 
                    Revoking permissions is generally considered good practice for establishing trust.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Revoke Mint Authority</h3>
                      <p className="text-sm text-muted-foreground">
                        Prevents creation of more tokens after initial supply
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={formData.revokeMint}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, revokeMint: checked }))}
                      />
                      <span className="text-sm font-medium text-solana">+{FEES.REVOKE_MINT} SOL</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Revoke Update Authority</h3>
                      <p className="text-sm text-muted-foreground">
                        Prevents modification of token metadata
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={formData.revokeUpdate}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, revokeUpdate: checked }))}
                      />
                      <span className="text-sm font-medium text-solana">+{FEES.REVOKE_UPDATE} SOL</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Revoke Freeze Authority</h3>
                      <p className="text-sm text-muted-foreground">
                        Prevents freezing of token accounts
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={formData.revokeFreeze}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, revokeFreeze: checked }))}
                      />
                      <span className="text-sm font-medium text-solana">+{FEES.REVOKE_FREEZE} SOL</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={goToPrevTab}>
                  Back
                </Button>
                <Button onClick={goToNextTab} className="bg-solana hover:bg-solana-dark">
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="socials" className="space-y-6 animate-fade-in">
              <div className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                    <Globe className="h-4 w-4" />
                    Project Social Links
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add social media links for your token. This helps with community building and establishing credibility.
                    <br />
                    <span className="text-solana font-medium">Adding any social links costs +{FEES.SOCIALS_UPDATE} SOL (one-time fee)</span>
                  </p>
                </div>

                {/* Toggle for including socials */}
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="includeSocials" 
                    checked={includeSocials}
                    onCheckedChange={(checked) => setIncludeSocials(checked)}
                  />
                  <Label htmlFor="includeSocials">Include social media links</Label>
                </div>

                {includeSocials && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="twitter" 
                          placeholder="https://twitter.com/youraccount" 
                          value={socialInputs.twitter}
                          onChange={(e) => handleSocialChange("twitter", e.target.value)}
                        />
                        <Button 
                          variant="outline"
                          onClick={() => addSocial("twitter")}
                          disabled={!socialInputs.twitter}
                        >
                          Add
                        </Button>
                      </div>
                      {formData.socials.find(s => s.platform === "twitter") && (
                        <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                          <span className="text-sm truncate">{formData.socials.find(s => s.platform === "twitter")?.url}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => removeSocial("twitter")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telegram">Telegram</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="telegram" 
                          placeholder="https://t.me/yourgroup" 
                          value={socialInputs.telegram}
                          onChange={(e) => handleSocialChange("telegram", e.target.value)}
                        />
                        <Button 
                          variant="outline"
                          onClick={() => addSocial("telegram")}
                          disabled={!socialInputs.telegram}
                        >
                          Add
                        </Button>
                      </div>
                      {formData.socials.find(s => s.platform === "telegram") && (
                        <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                          <span className="text-sm truncate">{formData.socials.find(s => s.platform === "telegram")?.url}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => removeSocial("telegram")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="website" 
                          placeholder="https://yourdomain.com" 
                          value={socialInputs.website}
                          onChange={(e) => handleSocialChange("website", e.target.value)}
                        />
                        <Button 
                          variant="outline"
                          onClick={() => addSocial("website")}
                          disabled={!socialInputs.website}
                        >
                          Add
                        </Button>
                      </div>
                      {formData.socials.find(s => s.platform === "website") && (
                        <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                          <span className="text-sm truncate">{formData.socials.find(s => s.platform === "website")?.url}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => removeSocial("website")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Toggle for creator information */}
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="includeCreatorInfo" 
                    checked={includeCreatorInfo}
                    onCheckedChange={(checked) => setIncludeCreatorInfo(checked)}
                  />
                  <Label htmlFor="includeCreatorInfo">Include creator information</Label>
                </div>

                {includeCreatorInfo ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Author Details</h3>
                    <div className="space-y-2">
                      <Label htmlFor="authorName">Your Name (Optional)</Label>
                      <Input 
                        id="authorName" 
                        placeholder="Project Creator" 
                        value={formData.authorName}
                        onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="authorEmail">Email (Optional)</Label>
                      <Input 
                        id="authorEmail" 
                        placeholder="contact@example.com" 
                        type="email"
                        value={formData.authorEmail || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, authorEmail: e.target.value }))}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
                    Default creator information will be used: SolanaMinter (contact@solanaminter.com)
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={goToPrevTab}>
                  Back
                </Button>
                <Button onClick={goToNextTab} className="bg-solana hover:bg-solana-dark">
                  Review <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="review" className="space-y-6 animate-fade-in">
              <div className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                    <Info className="h-4 w-4" />
                    Review Your Token
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Please review all details before creating your token. Token properties cannot be changed once revoked.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Token Details</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Name:</span>
                          <span className="text-sm font-medium">{formData.name || "Not set"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Symbol:</span>
                          <span className="text-sm font-medium">{formData.symbol || "Not set"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Supply:</span>
                          <span className="text-sm font-medium">{formData.supply.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Decimals:</span>
                          <span className="text-sm font-medium">{formData.decimals}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Metadata:</span>
                          <span className={cn(
                            "text-sm font-medium",
                            formData.includeMetadata ? "text-green-600" : "text-amber-600"
                          )}>
                            {formData.includeMetadata ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Permissions</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Revoke Mint:</span>
                          <span className={cn(
                            "text-sm font-medium",
                            formData.revokeMint ? "text-green-600" : "text-amber-600"
                          )}>
                            {formData.revokeMint ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Revoke Update:</span>
                          <span className={cn(
                            "text-sm font-medium",
                            formData.revokeUpdate ? "text-green-600" : "text-amber-600"
                          )}>
                            {formData.revokeUpdate ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Revoke Freeze:</span>
                          <span className={cn(
                            "text-sm font-medium",
                            formData.revokeFreeze ? "text-green-600" : "text-amber-600"
                          )}>
                            {formData.revokeFreeze ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Socials</h3>
                      <div className="mt-2">
                        {includeSocials && formData.socials.length > 0 ? (
                          <div className="space-y-2">
                            {formData.socials.map((social) => (
                              <div key={social.platform} className="flex justify-between">
                                <span className="text-sm text-muted-foreground capitalize">{social.platform}:</span>
                                <span className="text-sm font-medium truncate max-w-[200px]">{social.url}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No social links added</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Creator Info</h3>
                      <div className="mt-2">
                        {includeCreatorInfo ? (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Name:</span>
                              <span className="text-sm font-medium">{formData.authorName || "Not set"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Email:</span>
                              <span className="text-sm font-medium">{formData.authorEmail || "Not set"}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Using default: SolanaMinter</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <h3 className="text-sm font-medium mb-4 flex items-center gap-1.5">
                        <CircleDollarSign className="h-4 w-4 text-solana" />
                        Fee Breakdown
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Base Fee:</span>
                          <span className="text-sm font-medium">{FEES.BASE_FEE} SOL</span>
                        </div>
                        {formData.revokeMint && (
                          <div className="flex justify-between">
                            <span className="text-sm">Revoke Mint:</span>
                            <span className="text-sm font-medium">{FEES.REVOKE_MINT} SOL</span>
                          </div>
                        )}
                        {formData.revokeUpdate && (
                          <div className="flex justify-between">
                            <span className="text-sm">Revoke Update:</span>
                            <span className="text-sm font-medium">{FEES.REVOKE_UPDATE} SOL</span>
                          </div>
                        )}
                        {formData.revokeFreeze && (
                          <div className="flex justify-between">
                            <span className="text-sm">Revoke Freeze:</span>
                            <span className="text-sm font-medium">{FEES.REVOKE_FREEZE} SOL</span>
                          </div>
                        )}
                        {includeSocials && formData.socials.length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm">Social Links:</span>
                            <span className="text-sm font-medium">{FEES.SOCIALS_UPDATE} SOL</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-lg font-semibold pt-2">
                          <span>Total:</span>
                          <span className="text-solana">{totalFee} SOL</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg">
                      <LockIcon className="h-4 w-4 mt-0.5 text-amber-500" />
                      <div className="space-y-1">
                        <p className="text-sm">
                          Fees will be sent to the creator wallet address:
                        </p>
                        <code className="text-xs bg-muted p-1 rounded block break-all">
                          {OWNER_WALLET_ADDRESS}
                        </code>
                      </div>
                    </div>

                    {imagePreview && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium mb-2">Token Image Preview</h3>
                        <div className="w-24 h-24 rounded-lg overflow-hidden">
                          <img src={imagePreview} alt="Token" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={goToPrevTab}>
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="bg-solana hover:bg-solana-dark transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating token...
                    </>
                  ) : (
                    <>
                      Create Token
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="bg-muted/30 flex flex-col items-start px-6 py-4 text-xs text-muted-foreground">
          <p>
            By creating a token, you agree to our terms of service and acknowledge that you are responsible for your token's use.
          </p>
          <p className="mt-1">
            Fees are non-refundable and go directly to the specified wallet address.
          </p>
        </CardFooter>
      </Card>

      {/* Created Coin Display Modal */}
      <CreatedCoinDisplay 
        visible={createdCoin.visible}
        name={createdCoin.name}
        symbol={createdCoin.symbol}
        supply={createdCoin.supply}
        decimals={createdCoin.decimals}
        mintAddress={createdCoin.mintAddress}
        transactionId={createdCoin.transactionId}
        socials={createdCoin.socials}
        image={createdCoin.image}
        onClose={handleCloseCreatedCoin}
      />
    </div>
  );
}

export default CoinCreator;
