import { useEffect } from "react";
import { useHistory } from "@/hooks/use-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/StatsCard";

export default function History() {
  const history = useHistory();

  useEffect(() => {
    if (!history.data && !history.isFetching) history.refetch?.();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Analysis History
        </h1>
        <p className="text-muted-foreground">Recent analyses and uploads.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Runs</CardTitle>
          </CardHeader>
          <CardContent>
            {history.data?.length ? (
              <ul className="list-disc pl-5 text-sm">
                {history.data.map((h: any, i: number) => (
                  <li key={i} className="truncate">
                    {h.name || `Run ${i + 1}`}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">
                No history available.
              </div>
            )}
          </CardContent>
        </Card>

        <StatsCard label="Total Runs" value={`${history.data?.length || 0}`} />
      </div>
    </div>
  );
}
