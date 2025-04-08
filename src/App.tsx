import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AnimatePresence, motion } from "framer-motion";
import { bounceScale, spinTransition } from "@/lib/animations";

// Lazy load components
const LazyIndex = lazy(() => import("./pages/LazyIndex"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component
const LoadingFallback = () => (
  <motion.div
    {...bounceScale}
    className="flex items-center justify-center min-h-screen"
  >
    <motion.div
      {...spinTransition}
      className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
    />
  </motion.div>
);

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="app-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <motion.div
          className="min-h-screen bg-background text-foreground"
          {...bounceScale}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Toaster />
          <Sonner />
          <AnimatePresence mode="wait">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<LazyIndex />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AnimatePresence>
          <SpeedInsights />
        </motion.div>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;