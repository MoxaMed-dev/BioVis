import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

interface ProteinComparisonProps {
  proteinSeq1: string;
  proteinSeq2: string;
  matchString?: string;
  label1?: string;
  label2?: string;
  className?: string;
  windowSize?: number;
}

const AMINO_ACID_COLORS: Record<string, string> = {
  // Hydrophobic
  A: "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200", // Alanine
  V: "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200", // Valine
  I: "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200", // Isoleucine
  L: "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200", // Leucine
  M: "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200", // Methionine
  F: "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200", // Phenylalanine
  W: "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200", // Tryptophan
  P: "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200", // Proline

  // Polar
  S: "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-200", // Serine
  T: "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-200", // Threonine
  C: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-200", // Cysteine
  Y: "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-200", // Tyrosine
  N: "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-200", // Asparagine
  Q: "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-200", // Glutamine

  // Acidic
  D: "bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-200", // Aspartate
  E: "bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-200", // Glutamate

  // Basic
  K: "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200", // Lysine
  R: "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200", // Arginine
  H: "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200", // Histidine

  // Special
  G: "bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-200", // Glycine
  "-": "bg-gray-100 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400", // Gap
  "*": "text-gray-500 dark:text-gray-400", // Stop codon
  X: "bg-gray-100 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400", // Unknown
};

export function ProteinSequenceComparison({
  proteinSeq1,
  proteinSeq2,
  matchString,
  label1 = "Protein 1",
  label2 = "Protein 2",
  className,
  windowSize = 50,
}: ProteinComparisonProps) {
  const [startPos, setStartPos] = useState(0);

  const maxLength = Math.max(proteinSeq1.length, proteinSeq2.length);
  const endPos = Math.min(startPos + windowSize, maxLength);

  const visibleProt1 = proteinSeq1.slice(startPos, endPos);
  const visibleProt2 = proteinSeq2.slice(startPos, endPos);
  const visibleMatch = matchString ? matchString.slice(startPos, endPos) : "";

  const stats = useMemo(() => {
    if (!matchString) return { identities: 0, similarities: 0 };

    let identities = 0;
    let similarities = 0;

    for (let i = 0; i < Math.min(proteinSeq1.length, proteinSeq2.length); i++) {
      if (proteinSeq1[i] === proteinSeq2[i] && proteinSeq1[i] !== "-") {
        identities++;
        similarities++;
      } else if (areSimilarAA(proteinSeq1[i], proteinSeq2[i])) {
        similarities++;
      }
    }

    return {
      identities:
        maxLength > 0 ? ((identities / maxLength) * 100).toFixed(1) : 0,
      similarities:
        maxLength > 0 ? ((similarities / maxLength) * 100).toFixed(1) : 0,
    };
  }, [proteinSeq1, proteinSeq2, matchString, maxLength]);

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card overflow-hidden",
        className,
      )}
    >
      <div className="px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-sm">Protein Sequence Alignment</h3>
          <div className="text-xs text-muted-foreground">
            Position {startPos + 1} - {endPos} / {maxLength}
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(0, maxLength - windowSize)}
          value={startPos}
          onChange={(e) => setStartPos(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Protein 1 */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">
            {label1}
          </div>
          <div className="font-mono text-sm break-all leading-relaxed flex flex-wrap gap-px">
            {visibleProt1.split("").map((aa, i) => (
              <span
                key={`p1-${startPos}-${i}`}
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded text-xs font-bold",
                  AMINO_ACID_COLORS[aa.toUpperCase()] ||
                    "bg-gray-100 dark:bg-gray-900/30",
                )}
                title={getAminoAcidName(aa)}
              >
                {aa}
              </span>
            ))}
          </div>
        </div>

        {/* Match Line */}
        {matchString && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Match
            </div>
            <div className="font-mono text-sm break-all leading-relaxed flex flex-wrap gap-px">
              {visibleMatch.split("").map((symbol, i) => (
                <span
                  key={`match-${startPos}-${i}`}
                  className={cn(
                    "w-6 h-6 flex items-center justify-center text-xs font-bold",
                    symbol === ":"
                      ? "text-green-600 dark:text-green-400"
                      : symbol === "."
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-gray-400 dark:text-gray-600",
                  )}
                  title={
                    symbol === ":"
                      ? "Identity"
                      : symbol === "."
                        ? "Similarity"
                        : "Mismatch"
                  }
                >
                  {symbol}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Protein 2 */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">
            {label2}
          </div>
          <div className="font-mono text-sm break-all leading-relaxed flex flex-wrap gap-px">
            {visibleProt2.split("").map((aa, i) => (
              <span
                key={`p2-${startPos}-${i}`}
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded text-xs font-bold",
                  AMINO_ACID_COLORS[aa.toUpperCase()] ||
                    "bg-gray-100 dark:bg-gray-900/30",
                )}
                title={getAminoAcidName(aa)}
              >
                {aa}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded border border-border text-xs">
          <div>
            <span className="text-muted-foreground">Identities: </span>
            <span className="font-bold text-green-600 dark:text-green-400">
              {stats.identities}%
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Similarities: </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {stats.similarities}%
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <div className="text-xs font-semibold mb-2">Legend:</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-orange-100 dark:bg-orange-900/30"></span>
            <span>Hydrophobic</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30"></span>
            <span>Polar</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30"></span>
            <span>Acidic</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/30"></span>
            <span>Basic</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function areSimilarAA(aa1: string, aa2: string): boolean {
  const similar: Record<string, string[]> = {
    // Similar groups (Blosum62-like)
    A: ["S", "G", "T"],
    D: ["E", "N"],
    E: ["D", "Q"],
    F: ["Y", "W"],
    I: ["L", "M", "V"],
    K: ["R"],
    L: ["I", "M", "V"],
    M: ["I", "L", "V"],
    N: ["D", "S", "T"],
    Q: ["E", "K"],
    R: ["K"],
    S: ["A", "T", "N"],
    T: ["A", "S"],
    V: ["I", "L", "M"],
    W: ["Y"],
    Y: ["F", "W"],
  };

  const a1 = aa1.toUpperCase();
  const a2 = aa2.toUpperCase();

  if (a1 === a2) return true;
  return (similar[a1] || []).includes(a2) || (similar[a2] || []).includes(a1);
}

function getAminoAcidName(aa: string): string {
  const names: Record<string, string> = {
    A: "Alanine",
    R: "Arginine",
    N: "Asparagine",
    D: "Aspartate",
    C: "Cysteine",
    E: "Glutamate",
    Q: "Glutamine",
    G: "Glycine",
    H: "Histidine",
    I: "Isoleucine",
    L: "Leucine",
    K: "Lysine",
    M: "Methionine",
    F: "Phenylalanine",
    P: "Proline",
    S: "Serine",
    T: "Threonine",
    W: "Tryptophan",
    Y: "Tyrosine",
    V: "Valine",
    "-": "Gap",
    "*": "Stop Codon",
    X: "Unknown",
  };
  return names[aa.toUpperCase()] || "Unknown";
}
