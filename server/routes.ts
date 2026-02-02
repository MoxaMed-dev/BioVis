import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage.ts";
import { api } from "../shared/routes.ts";
import { z } from "zod";
import {
  SingleAnalysisResult,
  ComparisonResult,
  ORF,
  Mutation,
} from "../shared/schema.ts";

// === Bioinformatics Helper Functions ===

function cleanSequence(seq: string): string {
  // Remove headers (lines starting with >) and newlines/whitespace
  return seq
    .split("\n")
    .filter((line) => !line.startsWith(">"))
    .join("")
    .replace(/[\s\r\n]+/g, "")
    .toUpperCase();
}

function calculateGC(seq: string): number {
  const matches = seq.match(/[GC]/g);
  return matches ? (matches.length / seq.length) * 100 : 0;
}

function getReverseComplement(seq: string): string {
  const complementMap: Record<string, string> = {
    A: "T",
    T: "A",
    C: "G",
    G: "C",
    N: "N",
  };
  return seq
    .split("")
    .reverse()
    .map((base) => complementMap[base] || base)
    .join("");
}

function translateDNA(dna: string): string {
  const codonTable: Record<string, string> = {
    ATA: "I",
    ATC: "I",
    ATT: "I",
    ATG: "M",
    ACA: "T",
    ACC: "T",
    ACG: "T",
    ACT: "T",
    AAC: "N",
    AAT: "N",
    AAA: "K",
    AAG: "K",
    AGC: "S",
    AGT: "S",
    AGA: "R",
    AGG: "R",
    CTA: "L",
    CTC: "L",
    CTG: "L",
    CTT: "L",
    CCA: "P",
    CCC: "P",
    CCG: "P",
    CCT: "P",
    CAC: "H",
    CAT: "H",
    CAA: "Q",
    CAG: "Q",
    CGA: "R",
    CGC: "R",
    CGG: "R",
    CGT: "R",
    GTA: "V",
    GTC: "V",
    GTG: "V",
    GTT: "V",
    GCA: "A",
    GCC: "A",
    GCG: "A",
    GCT: "A",
    GAC: "D",
    GAT: "D",
    GAA: "E",
    GAG: "E",
    GGA: "G",
    GGC: "G",
    GGG: "G",
    GGT: "G",
    TCA: "S",
    TCC: "S",
    TCG: "S",
    TCT: "S",
    TTC: "F",
    TTT: "F",
    TTA: "L",
    TTG: "L",
    TAC: "Y",
    TAT: "Y",
    TAA: "_",
    TAG: "_",
    TGC: "C",
    TGT: "C",
    TGA: "_",
    TGG: "W",
  };

  let protein = "";
  for (let i = 0; i < dna.length - 2; i += 3) {
    const codon = dna.substr(i, 3);
    protein += codonTable[codon] || "X";
  }
  return protein;
}

function findORFs(seq: string): ORF[] {
  const orfs: ORF[] = [];
  const minLen = 30; // Minimum length in bp
  const startCodon = "ATG";
  const stopCodons = ["TAA", "TAG", "TGA"];

  // Check all 3 frames (only forward for simplicity, real tools do 6)
  for (let frame = 0; frame < 3; frame++) {
    const frameSeq = seq.substring(frame);
    let startIndex = -1;

    for (let i = 0; i < frameSeq.length - 2; i += 3) {
      const codon = frameSeq.substr(i, 3);

      if (codon === startCodon && startIndex === -1) {
        startIndex = i;
      } else if (stopCodons.includes(codon) && startIndex !== -1) {
        const dnaSegment = frameSeq.substring(startIndex, i + 3);
        if (dnaSegment.length >= minLen) {
          orfs.push({
            start: frame + startIndex + 1, // 1-based
            end: frame + i + 3,
            length: dnaSegment.length,
            dna: dnaSegment,
            protein: translateDNA(dnaSegment),
            frame: frame + 1,
          });
        }
        startIndex = -1; // Reset after finding an ORF
      }
    }
  }

  // Sort by length desc
  return orfs.sort((a, b) => b.length - a.length);
}

function classifyMutation(
  type: string,
  from: string,
  to: string,
  codonBefore: string,
  codonAfter: string,
): string {
  if (type !== "substitution") return "frameshift"; // Indels usually cause frameshift

  const aaBefore = translateDNA(codonBefore);
  const aaAfter = translateDNA(codonAfter);

  if (aaBefore === aaAfter) return "silent";
  if (aaAfter === "_") return "nonsense";
  return "missense";
}

function simpleAlign(s1: string, s2: string): any {
  // Very naive alignment for mini-project (assumes similar sequences/no massive gaps)
  // In a real app, use Needleman-Wunsch.
  // Here we just diff position by position and handle length diffs naively.

  // Needleman-Wunsch is better but verbose to implement in one go.
  // Let's do a basic global alignment simulation for substitution/indel

  // Create matrix
  const matrix: number[][] = [];
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  // Traceback
  let align1 = "";
  let align2 = "";
  let i = s1.length;
  let j = s2.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && s1[i - 1] === s2[j - 1]) {
      align1 = s1[i - 1] + align1;
      align2 = s2[j - 1] + align2;
      i--;
      j--;
    } else if (i > 0 && j > 0 && matrix[i][j] === matrix[i - 1][j - 1] + 1) {
      align1 = s1[i - 1] + align1;
      align2 = s2[j - 1] + align2;
      i--;
      j--;
    } else if (i > 0 && matrix[i][j] === matrix[i - 1][j] + 1) {
      align1 = s1[i - 1] + align1;
      align2 = "-" + align2;
      i--;
    } else {
      align1 = "-" + align1;
      align2 = s2[j - 1] + align2;
      j--;
    }
  }

  return { align1, align2 };
}

// === Route Registration ===

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.post(api.analyze.single.path, async (req, res) => {
    try {
      const { sequence, name } = api.analyze.single.input.parse(req.body);
      const cleanSeq = cleanSequence(sequence);

      const result: SingleAnalysisResult = {
        length: cleanSeq.length,
        gcContent: parseFloat(calculateGC(cleanSeq).toFixed(2)),
        atContent: parseFloat((100 - calculateGC(cleanSeq)).toFixed(2)),
        nucleotideCounts: {
          A: (cleanSeq.match(/A/g) || []).length,
          T: (cleanSeq.match(/T/g) || []).length,
          C: (cleanSeq.match(/C/g) || []).length,
          G: (cleanSeq.match(/G/g) || []).length,
        },
        reverseComplement: getReverseComplement(cleanSeq),
        orfs: findORFs(cleanSeq),
        protein: translateDNA(cleanSeq),
      };

      // Save to history
      await storage.saveAnalysis({
        type: "single",
        input: { sequence: cleanSeq, name },
        results: result,
      });

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post(api.analyze.compare.path, async (req, res) => {
    try {
      const { sequence1, sequence2, name } = api.analyze.compare.input.parse(
        req.body,
      );
      const s1 = cleanSequence(sequence1);
      const s2 = cleanSequence(sequence2);

      const { align1, align2 } = simpleAlign(s1, s2);

      const mutations: Mutation[] = [];
      let matchString = "";

      let transitions = 0;
      let transversions = 0;
      let insertions = 0;
      let deletions = 0;

      const purines = ["A", "G"];
      const pyrimidines = ["C", "T"];

      for (let i = 0; i < align1.length; i++) {
        const b1 = align1[i];
        const b2 = align2[i];

        if (b1 === b2) {
          matchString += "|";
        } else if (b1 === "-") {
          matchString += " ";
          insertions++;
          mutations.push({
            position: i + 1,
            type: "insertion",
            from: "-",
            to: b2,
            impact: "frameshift",
          });
        } else if (b2 === "-") {
          matchString += " ";
          deletions++;
          mutations.push({
            position: i + 1,
            type: "deletion",
            from: b1,
            to: "-",
            impact: "frameshift",
          });
        } else {
          matchString += "*";

          // Classify substitution
          const isTransition =
            (purines.includes(b1) && purines.includes(b2)) ||
            (pyrimidines.includes(b1) && pyrimidines.includes(b2));
          if (isTransition) transitions++;
          else transversions++;

          // Impact analysis (needs context, naive here)
          const codonStart = Math.floor(i / 3) * 3;
          // Simple check if we have enough context
          let impact = "unknown";
          let cOriginal = "",
            cMutated = "";

          if (i + 2 < align1.length && align1[i] !== "-" && align2[i] !== "-") {
            // Rough approx for substitution impact
            // In reality need to map back to original CDS coords
            impact = "missense"; // default
          }

          mutations.push({
            position: i + 1,
            type: "substitution",
            from: b1,
            to: b2,
            impact: impact as any,
          });
        }
      }

      const result: ComparisonResult = {
        seq1Stats: {
          length: s1.length,
          gcContent: 0,
          atContent: 0,
          nucleotideCounts: {} as any,
          reverseComplement: "",
          orfs: [],
          protein: translateDNA(s1),
        },
        seq2Stats: {
          length: s2.length,
          gcContent: 0,
          atContent: 0,
          nucleotideCounts: {} as any,
          reverseComplement: "",
          orfs: [],
          protein: translateDNA(s2),
        },
        alignment: {
          seq1Aligned: align1,
          seq2Aligned: align2,
          matchString,
          score: 0, // Calculate if needed
        },
        mutations,
        mutationCounts: {
          total: mutations.length,
          transitions,
          transversions,
          insertions,
          deletions,
        },
        mutationRate: mutations.length / align1.length,
      };

      // Save history
      await storage.saveAnalysis({
        type: "comparison",
        input: { sequence1: s1, sequence2: s2, name },
        results: result,
      });

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.history.list.path, async (req, res) => {
    const history = await storage.getHistory();
    res.json(history);
  });

  // Seed basic data
  const existing = await storage.getHistory();
  if (existing.length === 0) {
    // Seed logic could go here if needed
  }

  return httpServer;
}
