import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion, type HTMLMotionProps, Variants } from "framer-motion";

const cardVariants: Variants = {
  initial: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  animate: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  hover: { 
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  tap: { 
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const iconVariants: Variants = {
  initial: { 
    scale: 0.5,
    opacity: 0
  },
  animate: { 
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.2
    }
  },
  hover: { 
    scale: 1.1,
    rotate: 5,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const contentVariants: Variants = {
  initial: { 
    opacity: 0,
    y: 10
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.3
    }
  }
};

type FeatureCardProps = Omit<HTMLMotionProps<"div">, 'title'> & {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
};

export function FeatureCard({ title, description, icon: Icon, className, ...props }: FeatureCardProps) {
  return (
    <motion.div
      {...props}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      className={cn(
        "group relative rounded-2xl p-8 bg-card/50 backdrop-blur-sm text-card-foreground border border-border/60 shadow-lg hover:shadow-xl transition-all duration-300",
        "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-transparent before:to-solana/5 before:opacity-0 before:transition-opacity before:duration-300",
        "hover:before:opacity-100",
        "after:absolute after:inset-0 after:rounded-2xl after:bg-gradient-to-r after:from-solana/10 after:to-blue-500/10 after:opacity-0 after:blur-2xl after:transition-opacity after:duration-500",
        "hover:after:opacity-100",
        className
      )}
    >
      <motion.div
        variants={iconVariants}
        className="relative flex items-center justify-center w-14 h-14 rounded-xl mb-6 bg-gradient-to-br from-solana/10 to-blue-500/10 text-solana group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-solana group-hover:to-blue-500 transition-all duration-300 shadow-lg"
      >
        <Icon size={28} />
      </motion.div>
      <motion.div variants={contentVariants}>
        <motion.h3
          className="text-xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-solana to-blue-500"
        >
          {title}
        </motion.h3>
        <motion.p
          className="text-muted-foreground leading-relaxed"
        >
          {description}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
