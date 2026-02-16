"use client";

import { useEffect } from "react";
import { useDemoMode, useSupabaseHydration } from "./hooks";
import { setStoreDemoMode } from "@/store";
import { useStore } from "@/store";

export function DemoModeInitializer() {
  const { isDemoMode } = useDemoMode();
  const { creatives, campaigns } = useSupabaseHydration(isDemoMode);

  useEffect(() => {
    if (isDemoMode !== null) {
      setStoreDemoMode(isDemoMode);
    }
  }, [isDemoMode]);

  useEffect(() => {
    if (creatives) {
      useStore.setState({ creatives });
    }
  }, [creatives]);

  useEffect(() => {
    if (campaigns) {
      useStore.setState({ campaigns });
    }
  }, [campaigns]);

  return null;
}
