import { useState, useRef } from "react";
import { useSingleAnalysis } from "@/hooks/use-analysis";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SequenceViewer } from "@/components/SequenceViewer";
import { StatsCard } from "@/components/StatsCard";
import { Loader2, Dna, FileText, AlignLeft, Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function SingleAnalysis() {
  const [sequence, setSequence] = useState("");
  const analyze = useSingleAnalysis();

  const handleAnalyze = () => {
    if (!sequence.trim()) return;
    // Clean up sequence (remove headers if pasted FASTA, newlines)
    const cleanSeq = sequence.replace(/^>.*\n/, "").replace(/[\s\n\r]/g, "");
    analyze.mutate({ sequence: cleanSeq, name: "Single Analysis" });
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);

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

  const handleFileChange = async (e: any) => {
    const input = e.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    const text = await file.text();
    const seqs = parseFasta(text);
    setUploadedName(
      file.name + (seqs.length > 1 ? ` (+${seqs.length - 1} more)` : ""),
    );
    const seq = seqs[0].seq;
    setSequence(seq);
    analyze.mutate({ sequence: seq, name: file.name });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const result = analyze.data;

  const nucleotideData = result
    ? [
        { name: "A", value: result.nucleotideCounts.A, color: "#16a34a" },
        { name: "T", value: result.nucleotideCounts.T, color: "#dc2626" },
        { name: "G", value: result.nucleotideCounts.G, color: "#ca8a04" },
        { name: "C", value: result.nucleotideCounts.C, color: "#2563eb" },
      ]
    : [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Single Sequence Analysis
        </h1>
        <p className="text-muted-foreground">
          Enter a DNA sequence to calculate statistics and identify ORFs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Sequence</CardTitle>
              <CardDescription>
                Paste raw DNA sequence or FASTA format.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="ATCG..."
                className="font-mono min-h-[300px] resize-none text-sm leading-relaxed"
                value={sequence}
                onChange={(e) => setSequence(e.target.value)}
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".fa,.fasta,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Upload FASTA
                </Button>
                {uploadedName && (
                  <span className="text-xs text-muted-foreground ml-2 truncate">
                    {uploadedName}
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Length: {sequence.replace(/[\s\n\r]/g, "").length} bp
                </span>
                <Button
                  onClick={handleAnalyze}
                  disabled={analyze.isPending || !sequence}
                  className="w-32"
                >
                  {analyze.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Analyze"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {!result ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-muted/30">
              <Dna className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">
                Ready to analyze
              </p>
              <p className="text-xs text-muted-foreground max-w-xs text-center mt-2">
                Results will appear here after processing.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                  label="Length"
                  value={`${result.length} bp`}
                  icon={AlignLeft}
                />
                <StatsCard
                  label="GC Content"
                  value={`${result.gcContent.toFixed(1)}%`}
                  icon={Info}
                />
                <StatsCard
                  label="AT Content"
                  value={`${result.atContent.toFixed(1)}%`}
                  icon={Dna}
                />
                <StatsCard
                  label="ORFs Found"
                  value={result.orfs.length}
                  icon={FileText}
                />
              </div>

              {/* Visualization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Nucleotide Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={nucleotideData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {nucleotideData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 text-xs font-mono mt-2">
                      {nucleotideData.map((d) => (
                        <div key={d.name} className="flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: d.color }}
                          />
                          {d.name}: {d.value}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <SequenceViewer
                    sequence={
                      result.reverseComplement.substring(0, 200) + "..."
                    }
                    label="Reverse Complement (Preview)"
                  />
                </div>
              </div>

              {/* Protein Translation */}
              <Card>
                <CardHeader>
                  <CardTitle>Protein Translation (Longest ORF)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm break-all text-muted-foreground">
                    {result.protein}
                  </div>
                </CardContent>
              </Card>

              {/* ORF Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Open Reading Frames</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Frame</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>End</TableHead>
                        <TableHead>Length (aa)</TableHead>
                        <TableHead>Sequence (Preview)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.orfs.slice(0, 5).map((orf, i) => (
                        <TableRow key={i}>
                          <TableCell>{orf.frame}</TableCell>
                          <TableCell>{orf.start}</TableCell>
                          <TableCell>{orf.end}</TableCell>
                          <TableCell>{Math.floor(orf.length / 3)}</TableCell>
                          <TableCell className="font-mono text-xs max-w-[200px] truncate">
                            {orf.dna}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {result.orfs.length > 5 && (
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Showing top 5 of {result.orfs.length} ORFs
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
