import { z } from "zod";

// === Domain Types ===
export const dnaSequenceSchema = z.string().regex(/^[ATCGatcg\s\n\r]+$/, "Invalid DNA sequence. Only A, T, C, G allowed.");

export const singleAnalysisRequestSchema = z.object({
  sequence: dnaSequenceSchema,
  name: z.string().optional(),
});

export const comparisonRequestSchema = z.object({
  sequence1: dnaSequenceSchema,
  sequence2: dnaSequenceSchema,
  name: z.string().optional(),
});

// Response Types
export type ORF = {
  start: number;
  end: number;
  length: number;
  dna: string;
  protein: string;
  frame: number;
};

export type SingleAnalysisResult = {
  length: number;
  gcContent: number;
  atContent: number;
  nucleotideCounts: { A: number; T: number; C: number; G: number };
  reverseComplement: string;
  orfs: ORF[];
  protein: string;
};

export type Mutation = {
  position: number;
  type: "substitution" | "insertion" | "deletion";
  from: string;
  to: string;
  impact: "silent" | "missense" | "nonsense" | "frameshift" | "unknown";
  codonOriginal?: string;
  codonMutated?: string;
  aaOriginal?: string;
  aaMutated?: string;
};

export type ComparisonResult = {
  seq1Stats: SingleAnalysisResult;
  seq2Stats: SingleAnalysisResult;
  alignment: {
    seq1Aligned: string;
    seq2Aligned: string;
    matchString: string;
    score: number;
  };
  mutations: Mutation[];
  mutationCounts: {
    total: number;
    transitions: number;
    transversions: number;
    insertions: number;
    deletions: number;
  };
  mutationRate: number;
};

// Mock the analysis type for in-memory storage
export interface Analysis {
  id: string;
  type: string;
  input: any;
  results: any;
  createdAt: string;
}

export type InsertAnalysis = Omit<Analysis, "id" | "createdAt">;
export type SingleAnalysisRequest = z.infer<typeof singleAnalysisRequestSchema>;
export type ComparisonRequest = z.infer<typeof comparisonRequestSchema>;
