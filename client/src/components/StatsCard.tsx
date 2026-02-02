import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatsCard({ label, value, icon: Icon, subValue, className }: StatsCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <h3 className="mt-2 text-2xl font-bold text-foreground tracking-tight">{value}</h3>
          {subValue && (
            <p className="mt-1 text-xs text-muted-foreground">{subValue}</p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-primary/5 rounded-xl">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
