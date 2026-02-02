import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface SequenceViewerProps {
  sequence: string;
  className?: string;
  label?: string;
}

export function SequenceViewer({ sequence, className, label }: SequenceViewerProps) {
  const formattedSeq = useMemo(() => {
    return sequence.split("").map((char, i) => {
      let colorClass = "";
      switch (char.toUpperCase()) {
        case 'A': colorClass = "base-A"; break;
        case 'T': colorClass = "base-T"; break;
        case 'C': colorClass = "base-C"; break;
        case 'G': colorClass = "base-G"; break;
        default: colorClass = "text-muted-foreground";
      }
      return <span key={i} className={colorClass}>{char}</span>;
    });
  }, [sequence]);

  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      {label && (
        <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
          {label}
        </div>
      )}
      <div className="p-4 font-mono text-sm break-all leading-loose max-h-[300px] overflow-y-auto">
        {formattedSeq}
      </div>
    </div>
  );
}
