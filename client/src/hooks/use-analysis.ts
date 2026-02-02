import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { 
  type SingleAnalysisRequest, 
  type ComparisonRequest, 
  type Analysis,
  type SingleAnalysisResult,
  type ComparisonResult
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useHistory() {
  return useQuery({
    queryKey: [api.history.list.path],
    queryFn: async () => {
      const res = await fetch(api.history.list.path);
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.history.list.responses[200].parse(await res.json());
    },
  });
}

export function useSingleAnalysis() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: SingleAnalysisRequest) => {
      const res = await fetch(api.analyze.single.path, {
        method: api.analyze.single.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Analysis failed");
      }
      
      // We manually parse the result as SingleAnalysisResult
      return await res.json() as SingleAnalysisResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.history.list.path] });
      toast({
        title: "Analysis Complete",
        description: "Sequence successfully analyzed.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useComparisonAnalysis() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ComparisonRequest) => {
      const res = await fetch(api.analyze.compare.path, {
        method: api.analyze.compare.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Comparison failed");
      }

      return await res.json() as ComparisonResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.history.list.path] });
      toast({
        title: "Comparison Complete",
        description: "Sequences successfully aligned and compared.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
