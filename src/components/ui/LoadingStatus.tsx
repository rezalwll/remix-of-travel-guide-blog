import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoadingStatus({ message, className }: { message: string; className?: string }) {
  return (
    <div role="status" className={cn("flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground", className)}>
      <LoaderCircle aria-hidden="true" className="size-5 shrink-0 text-primary motion-safe:animate-spin" />
      <span>{message}</span>
    </div>
  );
}
