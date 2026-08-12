"use client";

import { Loader2, Square, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AiStatusBar({
  loading,
  label,
  elapsedMs,
  onCancel,
}: {
  loading: boolean;
  label?: string;
  elapsedMs?: number | null;
  onCancel?: () => void;
}) {
  if (!loading && (elapsedMs == null || elapsedMs <= 0)) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      {loading ? (
        <>
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            {label || "AI working…"}
          </Badge>
          {onCancel && (
            <Button type="button" size="sm" variant="outline" onClick={onCancel}>
              <Square className="h-3 w-3" />
              Cancel
            </Button>
          )}
        </>
      ) : (
        <Badge variant="outline" className="gap-1">
          <Zap className="h-3 w-3 text-primary" />
          Latest result · {(elapsedMs! / 1000).toFixed(1)}s
        </Badge>
      )}
    </div>
  );
}
