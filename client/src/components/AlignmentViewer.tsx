import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

interface AlignmentViewerProps {
  seq1: string;
  seq2: string;
  matchString: string;
  label1?: string;
  label2?: string;
  className?: string;
  windowSize?: number;
}

export function AlignmentViewer({
  seq1,
  seq2,
  matchString,
  label1 = "Sequence 1",
  label2 = "Sequence 2",
  className,
  windowSize = 80,
}: AlignmentViewerProps) {
  const [startPos, setStartPos] = useState(0);

  const endPos = Math.min(startPos + windowSize, seq1.length);
  const visibleSeq1 = seq1.slice(startPos, endPos);
  const visibleSeq2 = seq2.slice(startPos, endPos);
  const visibleMatch = matchString.slice(startPos, endPos);

  const renderAlignment = useMemo(() => {
    const lines = [];

    for (let i = 0; i < visibleSeq1.length; i++) {
      const c1 = visibleSeq1[i];
      const c2 = visibleSeq2[i];
      const match = visibleMatch[i];

      lines.push({
        index: startPos + i,
        char1: c1,
        char2: c2,
        symbol: match === "|" ? "|" : match === "*" ? "*" : " ",
        isMatch: match === "|",
        isMutation: match === "*",
      });
    }
    return lines;
  }, [visibleSeq1, visibleSeq2, visibleMatch, startPos]);

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card overflow-hidden",
        className,
      )}
    >
      <div className="px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-sm">Sequence Alignment</h3>
          <div className="text-xs text-muted-foreground">
            Position {startPos + 1} - {endPos} / {seq1.length}
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(0, seq1.length - windowSize)}
          value={startPos}
          onChange={(e) => setStartPos(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="p-4 font-mono text-xs space-y-1 max-h-96 overflow-y-auto">
        <div className="text-muted-foreground text-xs mb-2">{label1}</div>
        <div className="whitespace-pre leading-relaxed">
          {visibleSeq1.split("").map((char, i) => (
            <span
              key={`seq1-${startPos}-${i}`}
              className={getBaseColorClass(char)}
            >
              {char}
            </span>
          ))}
        </div>

        <div className="text-yellow-600 dark:text-yellow-400 font-bold whitespace-pre leading-relaxed">
          {visibleMatch}
        </div>

        <div className="text-muted-foreground text-xs mb-2 mt-3">{label2}</div>
        <div className="whitespace-pre leading-relaxed">
          {visibleSeq2.split("").map((char, i) => (
            <span
              key={`seq2-${startPos}-${i}`}
              className={getBaseColorClass(char)}
            >
              {char}
            </span>
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted/30 rounded border border-border text-xs">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-muted-foreground">Matches: </span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {visibleMatch.split("").filter((c) => c === "|").length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Mutations: </span>
              <span className="font-bold text-red-600 dark:text-red-400">
                {visibleMatch.split("").filter((c) => c === "*").length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Gaps: </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {visibleMatch.split("").filter((c) => c === "-").length}
              </span>
            </div>
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
    case "-":
      return "text-muted-foreground";
    default:
      return "text-muted-foreground";
  }
}
