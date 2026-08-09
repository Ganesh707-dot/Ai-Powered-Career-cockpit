"use client";

import { useCallback, useRef } from "react";

/** Ensures only the latest async AI request can update UI state. */
export function useLatestRequest() {
  const seqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const begin = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const seq = ++seqRef.current;
    return {
      signal: controller.signal,
      isCurrent: () => seqRef.current === seq && !controller.signal.aborted,
      abort: () => controller.abort(),
    };
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    seqRef.current += 1;
  }, []);

  return { begin, cancel };
}

export function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (err instanceof Error && err.name === "AbortError")
  );
}
