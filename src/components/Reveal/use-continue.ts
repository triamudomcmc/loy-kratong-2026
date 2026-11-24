"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** The reveal plays for this long, then leaves on its own (or on any tap / key). */
const HOLD_MS = 5200;

/**
 * Moves on to the river after the reveal: after HOLD_MS, or at once on tap / click / key. `leaving` flips first so the
 * screen can fade out (`outMs`), then the route changes, like the story does before /create.
 */
export function useContinue(outMs: number) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);

  const go = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setLeaving(true);
    window.setTimeout(() => router.replace("/loykratong"), outMs);
  }, [router, outMs]);

  useEffect(() => {
    router.prefetch("/loykratong");
    const t = window.setTimeout(go, HOLD_MS);
    window.addEventListener("keydown", go);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", go);
    };
  }, [router, go]);

  return { leaving, go };
}
