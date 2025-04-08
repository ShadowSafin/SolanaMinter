import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { bounceScale, spinTransition, staggerContainer } from "@/lib/animations";

// Lazy load the Index component
const Index = lazy(() => import("./Index"));

// Loading component with animation
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

const LazyIndex = () => (
  <Suspense fallback={<LoadingFallback />}>
    <motion.div
      {...staggerContainer}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Index />
    </motion.div>
  </Suspense>
);

export default LazyIndex;