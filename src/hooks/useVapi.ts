"use client";

import { useCallback, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/web";

export function useVapi() {
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) return;

    try {
      vapiRef.current = new Vapi(publicKey);
    } catch (error) {
      console.warn("[Vapi] Failed to initialize SDK", error);
      vapiRef.current = null;
      return;
    }

    return () => {
      void vapiRef.current?.stop().catch((error: unknown) => {
        console.warn("[Vapi] Failed to stop SDK on cleanup", error);
      });
      vapiRef.current = null;
    };
  }, []);

  const startCall = useCallback(async () => {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    if (!assistantId || !vapiRef.current) return;

    try {
      await vapiRef.current.start(assistantId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error ?? "unknown error");
      console.warn("[Vapi] startCall failed:", message);
    }
  }, []);

  const stopCall = useCallback(async () => {
    if (!vapiRef.current) return;

    try {
      await vapiRef.current.stop();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error ?? "unknown error");
      console.warn("[Vapi] stopCall failed:", message);
    }
  }, []);

  return { startCall, stopCall };
}
