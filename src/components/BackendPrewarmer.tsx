"use client";

import { api } from "@/lib/apiClient";
import { useEffect } from "react";

export function BackendPrewarmer() {
  useEffect(() => {
    api.nearby().catch(() => null);
  }, []);

  return null;
}
