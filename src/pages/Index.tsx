import { ArrowRightIcon, Check, Coins, LockIcon, PackageOpen, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CoinCreator from "@/components/CoinCreator";
import CreatedCoinsList from "@/components/CreatedCoinsList";
import { FEES } from "@/lib/constants";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 container relative overflow-hidden">
          <div className="absolute -top-48 -right-48 w-96 h-96 bg-solana/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-3xl mx-auto text-center relative">
            <div className="inline-block px-3 py-1 bg-muted/80 rounded-full text-xs font-medium mb-6 animate-fade-in">
              Powered by Solana
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-slide-down">
              Launch Your Memecoin <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-solana to-blue-500 text-transparent bg-clip-text">
                in Minutes
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-slide-down animation-delay-100">
              Create, customize, and launch your own Solana memecoin with just a few clicks. 
              No coding required, fair pricing, instant deployment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-200">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-solana to-solana-dark hover:opacity-90 transition-opacity rounded-full"
                onClick={() => window.location.href = "#create-coin"}
              >
                Create Your Coin <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full" onClick={() => window.location.href = "#features"}>
                Learn More
              </Button>
            </div>
          </div>
        </section>
        
        {/* Your Created Coins Section */}
        <section id="your-coins" className="py-12 container">
          <div className="max-w-4xl mx-auto">
            <CreatedCoinsList />
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose SolanaMinter</h2>
              <p className="text-muted-foreground">
                A seamless experience from concept to launch, with all the features you need to create a successful memecoin.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={Coins}
                title="Simple Creation"
                description="Create your token in minutes with a user-friendly interface. No coding knowledge required."
                className="animate-fade-in"
              />
              <FeatureCard 
                icon={LockIcon}
                title="Security Options"
                description="Optionally revoke mint, update, and freeze authorities for increased community trust."
                className="animate-fade-in animation-delay-100"
              />
              <FeatureCard 
                icon={PackageOpen}
                title="Customizable"
                description="Set your token supply, decimals, and add social media links to boost your project's visibility."
                className="animate-fade-in animation-delay-200"
              />
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground">
                Creating your memecoin is a simple four-step process
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="font-bold">1</span>
                </div>
                <h3 className="font-medium mb-2">Connect Wallet</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your Solana wallet to get started with the creation process
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="font-bold">2</span>
                </div>
                <h3 className="font-medium mb-2">Configure Token</h3>
                <p className="text-sm text-muted-foreground">
                  Set your token name, symbol, supply, and security options
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="font-bold">3</span>
                </div>
                <h3 className="font-medium mb-2">Review & Pay</h3>
                <p className="text-sm text-muted-foreground">
                  Review your settings and pay the associated fees
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="font-bold">4</span>
                </div>
                <h3 className="font-medium mb-2">Token Created</h3>
                <p className="text-sm text-muted-foreground">
                  Your token is created instantly on the Solana blockchain
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-muted/30">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground">
                Pay only for what you need with clear, upfront pricing
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="bg-card text-card-foreground rounded-2xl overflow-hidden shadow-lg border border-border/50">
                <div className="bg-gradient-to-r from-solana/10 to-blue-500/10 px-6 py-4 border-b border-border/50">
                  <h3 className="font-bold text-lg">Memecoin Creation Fees</h3>
                </div>
                
                <div className="px-6 py-6 space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span>Base Fee</span>
                    <span className="font-semibold">{FEES.BASE_FEE} SOL</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-t border-border/30">
                    <div>
                      <span>Revoke Mint Authority</span>
                      <p className="text-xs text-muted-foreground">Prevents creation of additional tokens</p>
                    </div>
                    <span className="font-semibold">+{FEES.REVOKE_MINT} SOL</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-t border-border/30">
                    <div>
                      <span>Revoke Update Authority</span>
                      <p className="text-xs text-muted-foreground">Prevents metadata changes</p>
                    </div>
                    <span className="font-semibold">+{FEES.REVOKE_UPDATE} SOL</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-t border-border/30">
                    <div>
                      <span>Revoke Freeze Authority</span>
                      <p className="text-xs text-muted-foreground">Prevents freezing of token accounts</p>
                    </div>
                    <span className="font-semibold">+{FEES.REVOKE_FREEZE} SOL</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-t border-border/30">
                    <div>
                      <span>Social Links & Author Info</span>
                      <p className="text-xs text-muted-foreground">Add project socials and creator details</p>
                    </div>
                    <span className="font-semibold">+{FEES.SOCIALS_UPDATE} SOL</span>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-muted/30 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    All fees are paid directly to the creator wallet. Network fees may apply separately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section id="faq" className="py-20">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Got questions? We've got answers
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-card text-card-foreground rounded-lg p-6 border border-border/50">
                <h3 className="font-medium mb-2">What is a memecoin?</h3>
                <p className="text-muted-foreground">
                  A memecoin is a cryptocurrency created around an internet meme, joke, or community concept. Unlike utility tokens, memecoins often focus on community engagement and viral growth.
                </p>
              </div>
              
              <div className="bg-card text-card-foreground rounded-lg p-6 border border-border/50">
                <h3 className="font-medium mb-2">Why should I revoke authorities?</h3>
                <p className="text-muted-foreground">
                  Revoking authorities (mint, update, freeze) increases trust in your token by removing the ability for anyone to manipulate the token after creation. This is often viewed favorably by the community.
                </p>
              </div>
              
              <div className="bg-card text-card-foreground rounded-lg p-6 border border-border/50">
                <h3 className="font-medium mb-2">What wallet can I use?</h3>
                <p className="text-muted-foreground">
                  SolanaMinter supports popular Solana wallets like Phantom, Solflare, and others that connect via the Solana wallet adapter.
                </p>
              </div>
              
              <div className="bg-card text-card-foreground rounded-lg p-6 border border-border/50">
                <h3 className="font-medium mb-2">How long does token creation take?</h3>
                <p className="text-muted-foreground">
                  Token creation happens almost instantly after confirmation of the transaction. You'll receive the token address immediately after the transaction is confirmed on the Solana blockchain.
                </p>
              </div>
              
              <div className="bg-card text-card-foreground rounded-lg p-6 border border-border/50">
                <h3 className="font-medium mb-2">Can I edit my token after creation?</h3>
                <p className="text-muted-foreground">
                  If you don't revoke the update authority, you can modify certain metadata after creation. However, once authorities are revoked, those aspects cannot be changed.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Create Coin Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Create Your Memecoin</h2>
              <p className="text-muted-foreground">
                Fill out the form below to create your custom Solana memecoin
              </p>
            </div>
            
            <CoinCreator />
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-muted/30 to-muted/50">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Launch Your Memecoin?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join the growing community of creators on Solana
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-solana" />
                  <span>No coding required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-solana" />
                  <span>Instant deployment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-solana" />
                  <span>Full customization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-solana" />
                  <span>Fair, transparent pricing</span>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="mt-8 bg-gradient-to-r from-solana to-solana-dark hover:opacity-90 transition-opacity rounded-full"
                onClick={() => window.location.href = "#create-coin"}
              >
                Get Started Now <Wallet className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
