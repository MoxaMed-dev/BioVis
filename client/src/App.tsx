import { Switch, Route } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";

import Dashboard from "@/pages/Dashboard";
import SingleAnalysis from "@/pages/SingleAnalysis";
import Comparison from "@/pages/Comparison";
import Viewer from "@/pages/Viewer";
import History from "@/pages/History";
// import NotFound from "@/pages/not-found";

function Router() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-72"}`}
      >
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/analyze" component={SingleAnalysis} />
          <Route path="/compare" component={Comparison} />
          <Route path="/viewer" component={Viewer} />
          <Route path="/history" component={History} />
          {/* <Route component={NotFound} /> */}
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
