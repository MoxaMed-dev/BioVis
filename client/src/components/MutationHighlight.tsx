import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface Mutation {
  position: number;
  type: "substitution" | "insertion" | "deletion";
  from: string;
  to: string;
  impact: "silent" | "missense" | "nonsense" | "frameshift" | "unknown";
  codonOriginal?: string;
  codonMutated?: string;
  aaOriginal?: string;
  aaMutated?: string;
}

interface MutationHighlightProps {
  sequence: string;
  mutations: Mutation[];
  className?: string;
  label?: string;
  onMutationClick?: (mutation: Mutation, index: number) => void;
  highlightedIndex?: number;
}

export function MutationHighlight({
  sequence,
  mutations,
  className,
  label,
  onMutationClick,
  highlightedIndex,
}: MutationHighlightProps) {
  const mutationMap = useMemo(() => {
    const map = new Map<number, Mutation[]>();
    mutations.forEach((mut) => {
      if (!map.has(mut.position)) {
        map.set(mut.position, []);
      }
      map.get(mut.position)!.push(mut);
    });
    return map;
  }, [mutations]);

  const formattedSeq = useMemo(() => {
    return sequence.split("").map((char, i) => {
      const muts = mutationMap.get(i);
      if (!muts || muts.length === 0) {
        return (
          <span key={i} className={getBaseColorClass(char)}>
            {char}
          </span>
        );
      }

      const mut = muts[0];
      let bgClass = "bg-red-100 dark:bg-red-900/30";
      let borderClass = "border-b-2 border-red-500";

      if (mut.impact === "silent") {
        bgClass = "bg-yellow-100 dark:bg-yellow-900/30";
        borderClass = "border-b-2 border-yellow-500";
      } else if (mut.impact === "frameshift") {
        bgClass = "bg-purple-100 dark:bg-purple-900/30";
        borderClass = "border-b-2 border-purple-500";
      }

      return (
        <span
          key={i}
          className={cn(
            "cursor-pointer px-1 rounded transition-all hover:shadow-md",
            bgClass,
            borderClass,
            getBaseColorClass(char),
            highlightedIndex === i && "ring-2 ring-offset-1 ring-primary",
          )}
          onClick={() => onMutationClick?.(mut, i)}
          title={`${mut.type}: ${mut.from} → ${mut.to}`}
        >
          {char}
        </span>
      );
    });
  }, [sequence, mutationMap, onMutationClick, highlightedIndex]);

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card overflow-hidden",
        className,
      )}
    >
      {label && (
        <div className="px-4 py-2 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
          {label}
        </div>
      )}
      <div className="p-4 font-mono text-sm break-all leading-loose max-h-[400px] overflow-y-auto">
        {formattedSeq}
      </div>
      <div className="px-4 py-3 border-t border-border bg-muted/30 text-xs space-y-1">
        <div className="font-semibold mb-2">Mutation Legend:</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30 border-b-2 border-red-500"></span>
            <span className="text-muted-foreground">Missense/Frameshift</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/30 border-b-2 border-yellow-500"></span>
            <span className="text-muted-foreground">Silent</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getBaseColorClass(char: string): string {
  switch (char.toUpperCase()) {
    case "A":
      return "text-green-600 dark:text-green-400 font-bold";
    case "T":
      return "text-red-600 dark:text-red-400 font-bold";
    case "C":
      return "text-blue-600 dark:text-blue-400 font-bold";
    case "G":
      return "text-yellow-600 dark:text-yellow-400 font-bold";
    default:
      return "text-muted-foreground";
  }
}
