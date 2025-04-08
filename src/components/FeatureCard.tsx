import { cn } from "@/lib/utils";
import { IconType } from "react-icons";
import { motion, type HTMLMotionProps, Variants } from "framer-motion";
import { cardHover, interactiveHover } from "@/lib/animations";

type FeatureCardProps = Omit<HTMLMotionProps<"div">, 'title'> & {
  title: string;
  description: string;
  icon: IconType;
  className?: string;
};

export function FeatureCard({ title, description, icon: Icon, className, ...props }: FeatureCardProps) {
  return (
    <motion.div
      {...props}
      variants={cardHover}
      whileHover="hover"
      whileTap="tap"
      className={cn(
        "group rounded-2xl p-6 bg-card text-card-foreground border border-border/60 shadow-sm",
        className
      )}
    >
      <motion.div
        variants={interactiveHover}
        className="flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-secondary text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300"
      >
        <Icon size={24} />
      </motion.div>
      <motion.h3
        variants={interactiveHover}
        className="text-lg font-semibold mb-2"
      >
        {title}
      </motion.h3>
      <motion.p
        variants={interactiveHover}
        className="text-muted-foreground"
      >
        {description}
      </motion.p>
    </motion.div>
  );
}
