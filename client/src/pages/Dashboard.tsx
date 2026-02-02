import { motion } from "framer-motion";
import { Link } from "wouter";
import { Dna, GitCompare, History, Box, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-display mb-4">
          <span className="text-primary">Dashboard</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Advanced tools for sequence analysis, alignment, and structural
          visualization. Start by selecting a tool below.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <motion.div
          variants={item}
          className="col-span-1 lg:col-span-2 row-span-2"
        >
          <div className="h-full rounded-2xl bg-gradient-to-br from-primary/90 to-primary p-8 text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500">
              <Dna className="w-64 h-64" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Single Sequence Analysis
                </h2>
                <p className="text-primary-foreground/80 text-lg max-w-md mb-8">
                  Analyze DNA sequences for GC content, Open Reading Frames
                  (ORFs), and perform translation to protein sequences
                  instantly.
                </p>
              </div>
              <Link href="/analyze">
                <Button size="lg" variant="secondary" className="w-fit gap-2">
                  Start Analysis <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
            <GitCompare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">Sequence Alignment</h3>
          <p className="text-muted-foreground mb-6 text-sm">
            Compare two sequences to identify mutations, insertions, and
            deletions with visual highlighting.
          </p>
          <Link href="/compare">
            <Button variant="outline" className="w-full">
              Compare Sequences
            </Button>
          </Link>
        </motion.div>

        <motion.div
          variants={item}
          className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
            <Box className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">3D Structure Viewer</h3>
          <p className="text-muted-foreground mb-6 text-sm">
            Visualize protein structures from the PDB database or AlphaFold in
            an interactive 3D environment.
          </p>
          <Link href="/viewer">
            <Button variant="outline" className="w-full">
              View Structures
            </Button>
          </Link>
        </motion.div>

        {/* <motion.div variants={item} className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <History className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold">Recent History</h3>
                <p className="text-xs text-muted-foreground">Your past analyses</p>
              </div>
            </div>
            <Link href="/history">
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium">Analysis #{1000 + i}</span>
                </div>
                <span className="text-xs text-muted-foreground">2h ago</span>
              </div>
            ))}
          </div>
        </motion.div> */}
      </motion.div>
    </div>
  );
}
