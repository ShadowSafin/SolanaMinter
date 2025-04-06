import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn(
      "group rounded-2xl p-6 transition-all duration-300 hover-lift bg-card text-card-foreground border border-border/60 shadow-sm",
      className
    )}>
      <div className="flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-secondary text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

export default FeatureCard;
