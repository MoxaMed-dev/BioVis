import { useState, useRef } from "react";
import { useComparisonAnalysis } from "@/hooks/use-analysis";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatsCard } from "@/components/StatsCard";
import { AlignmentViewer } from "@/components/AlignmentViewer";
import { MutationHighlight } from "@/components/MutationHighlight";
import { Loader2, GitCompare, AlertTriangle, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Comparison() {
  const [seq1, setSeq1] = useState("");
  const [seq2, setSeq2] = useState("");
  const compare = useComparisonAnalysis();
  const [highlightedMutationIndex, setHighlightedMutationIndex] = useState<
    number | undefined
  >();

  const fileInputRef1 = useRef<HTMLInputElement | null>(null);
  const fileInputRef2 = useRef<HTMLInputElement | null>(null);
  const [uploadedName1, setUploadedName1] = useState<string | null>(null);
  const [uploadedName2, setUploadedName2] = useState<string | null>(null);

  const parseFasta = (text: string) => {
    const lines = text.split(/\r?\n/);
    const seqs: { header: string; seq: string }[] = [];
    let currentHeader: string | null = null;
    let currentSeq = "";
    for (const line of lines) {
      if (line.startsWith(">")) {
        if (currentHeader !== null)
          seqs.push({ header: currentHeader, seq: currentSeq });
        currentHeader = line.slice(1).trim();
        currentSeq = "";
      } else {
        currentSeq += line.trim();
      }
    }
    if (currentHeader !== null)
      seqs.push({ header: currentHeader, seq: currentSeq });
    if (seqs.length === 0) {
      const cleaned = text.replace(/[\s\n\r]/g, "");
      return [{ header: "sequence", seq: cleaned }];
    }
    return seqs;
  };

  const clearInputRef = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) ref.current.value = "";
  };

  const handleFileChange1 = async (e: any) => {
    const input = e.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    const text = await file.text();
    const seqs = parseFasta(text);
    setUploadedName1(
      file.name + (seqs.length > 1 ? ` (+${seqs.length - 1} more)` : ""),
    );
    const seq = seqs[0].seq;
    setSeq1(seq);
    if (seq2.trim()) {
      const clean1 = seq.replace(/^>.*\n/, "").replace(/[\s\n\r]/g, "");
      const clean2 = seq2.replace(/^>.*\n/, "").replace(/[\s\n\r]/g, "");
      compare.mutate({
        sequence1: clean1,
        sequence2: clean2,
        name: "Comparison (from upload)",
      });
    }
    clearInputRef(fileInputRef1);
  };

  const handleFileChange2 = async (e: any) => {
    const input = e.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    const text = await file.text();
    const seqs = parseFasta(text);
    setUploadedName2(
      file.name + (seqs.length > 1 ? ` (+${seqs.length - 1} more)` : ""),
    );
    const seq = seqs[0].seq;
    setSeq2(seq);
    if (seq1.trim()) {
      const clean1 = seq1.replace(/^>.*\n/, "").replace(/[\s\n\r]/g, "");
      const clean2 = seq.replace(/^>.*\n/, "").replace(/[\s\n\r]/g, "");
      compare.mutate({
        sequence1: clean1,
        sequence2: clean2,
        name: "Comparison (from upload)",
      });
    }
    clearInputRef(fileInputRef2);
  };

  const handleCompare = () => {
    if (!seq1.trim() || !seq2.trim()) return;
    const clean1 = seq1.replace(/^>.*\n/, "").replace(/[\s\n\r]/g, "");
    const clean2 = seq2.replace(/^>.*\n/, "").replace(/[\s\n\r]/g, "");
    compare.mutate({
      sequence1: clean1,
      sequence2: clean2,
      name: "Comparison Run",
    });
  };

  const result = compare.data;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Sequence Comparison
        </h1>
        <p className="text-muted-foreground">
          Align two DNA sequences to detect point mutations, insertions, and
          deletions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Reference Sequence (Seq 1)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={seq1}
              onChange={(e) => setSeq1(e.target.value)}
              placeholder="Paste reference sequence..."
              className="font-mono h-32 resize-none"
            />
            <div className="mt-2 flex items-center gap-2">
              <input
                ref={fileInputRef1}
                type="file"
                accept=".fa,.fasta,.txt"
                className="hidden"
                onChange={handleFileChange1}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef1.current?.click()}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Upload FASTA
              </Button>
              {uploadedName1 && (
                <span className="text-xs text-muted-foreground ml-2 truncate">
                  {uploadedName1}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Query Sequence (Seq 2)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={seq2}
              onChange={(e) => setSeq2(e.target.value)}
              placeholder="Paste query sequence..."
              className="font-mono h-32 resize-none"
            />
            <div className="mt-2 flex items-center gap-2">
              <input
                ref={fileInputRef2}
                type="file"
                accept=".fa,.fasta,.txt"
                className="hidden"
                onChange={handleFileChange2}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef2.current?.click()}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Upload FASTA
              </Button>
              {uploadedName2 && (
                <span className="text-xs text-muted-foreground ml-2 truncate">
                  {uploadedName2}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleCompare}
          disabled={compare.isPending || !seq1 || !seq2}
          className="w-full md:w-auto"
        >
          {compare.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Aligning...
            </>
          ) : (
            <>
              <GitCompare className="mr-2 h-4 w-4" />
              Run Alignment
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              label="Alignment Score"
              value={result.alignment.score.toFixed(0)}
            />
            <StatsCard
              label="Identity"
              value={`${(100 - result.mutationRate * 100).toFixed(1)}%`}
            />
            <StatsCard
              label="Mutations"
              value={result.mutationCounts.total}
              icon={AlertTriangle}
              className={
                result.mutationCounts.total > 0
                  ? "border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-900/10"
                  : ""
              }
            />
            <StatsCard
              label="Gaps"
              value={
                result.mutationCounts.insertions +
                result.mutationCounts.deletions
              }
            />
          </div>

          {/* Enhanced Alignment Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Sequence Alignment (Symbol-based)</CardTitle>
              <CardDescription>
                <span className="text-green-600 dark:text-green-400 font-bold">
                  |
                </span>{" "}
                Perfect match •{" "}
                <span className="text-red-600 dark:text-red-400 font-bold">
                  *
                </span>{" "}
                Mutation •{" "}
                <span className="text-blue-600 dark:text-blue-400">-</span> Gap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <AlignmentViewer
                  seq1={result.alignment.seq1Aligned}
                  seq2={result.alignment.seq2Aligned}
                  matchString={result.alignment.matchString}
                  label1="Reference (Seq 1)"
                  label2="Query (Seq 2)"
                  windowSize={100}
                />
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Mutation Highlighting */}
          {result.mutations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Mutations with Highlighting</CardTitle>
                <CardDescription>
                  Click on mutations to highlight them. Color indicates impact
                  level.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MutationHighlight
                  sequence={result.alignment.seq1Aligned}
                  mutations={result.mutations}
                  label="Reference Sequence with Mutations"
                  highlightedIndex={highlightedMutationIndex}
                  onMutationClick={(mut, idx) => {
                    setHighlightedMutationIndex(idx);
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Mutation Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Identified Mutations ({result.mutations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.mutations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No mutations found. Sequences are identical.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {result.mutations.map((mut: any, i: number) => (
                    <div
                      key={i}
                      role="button"
                      onClick={() => setHighlightedMutationIndex(mut.position)}
                      className="cursor-pointer flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold text-xs">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-sm">
                            Position {mut.position}:{" "}
                            <span className="font-mono text-muted-foreground">
                              {mut.from}
                            </span>{" "}
                            →{" "}
                            <span className="font-mono font-bold">
                              {mut.to}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {mut.type}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          mut.impact === "silent"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {mut.impact.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
