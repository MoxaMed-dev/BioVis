import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Viewer() {
  const [pdbId, setPdbId] = useState("1cbs"); // Default protein for test
  const [inputVal, setInputVal] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setPdbId(inputVal.trim().toLowerCase());
    }
  };

  return (
    <div className="p-6 md:p-8 h-full flex flex-col max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            3D Structure Viewer
          </h1>
          <p className="text-muted-foreground">
            Explore macromolecular structures from the RCSB PDB.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <Input
            placeholder="Enter PDB ID (e.g., 4hhb)"
            className="w-full md:w-64"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <Button type="submit">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </div>

      <div className="flex-1 min-h-[500px] bg-card rounded-2xl border border-border overflow-hidden relative shadow-lg">
        {/* We use Mol* Viewer hosted by RCSB or similar */}
        <iframe
          className="w-full h-full absolute inset-0 border-0"
          src={`https://molstar.org/viewer/?pdb=${pdbId}&hide-controls=0`}
          title="Mol* Viewer"
          allow="fullscreen"
        />

        <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-md text-white p-4 rounded-xl max-w-xs pointer-events-none">
          <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">
            Current Structure
          </p>
          <h3 className="text-2xl font-bold font-mono">
            {pdbId.toUpperCase()}
          </h3>
          <p className="text-xs text-white/70 mt-2">
            Loaded from RCSB PDB. Interaction enabled.
          </p>
        </div>
      </div>
    </div>
  );
}
