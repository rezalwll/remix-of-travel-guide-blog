"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useState, type ReactNode } from "react";
import { AuthProvider } from "@/context/AuthProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ApiError } from "@/services/apiClient";
import RouteTransitionOverlay from "@/components/next/RouteTransitionOverlay";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: (count, error) => count < 1 && (!(error instanceof ApiError) || error.status === 0 || error.status >= 500) },
      mutations: { retry: false },
    },
  }));
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          {children}
          <Suspense fallback={null}><RouteTransitionOverlay /></Suspense>
          <Toaster />
          <Sonner />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
