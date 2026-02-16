"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "./client";
import { creativeRowToApp, campaignRowToApp } from "./types";
import type { ConfigFlagRow, CreativeRow, CampaignRow } from "./types";
import type { Creative, Campaign } from "@/types";
import { setStoreDemoMode } from "@/store";

let _cachedDemoMode: boolean | null = null;
const _listeners = new Set<(v: boolean) => void>();

function notifyListeners(value: boolean) {
  _cachedDemoMode = value;
  _listeners.forEach((fn) => fn(value));
}

export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState<boolean | null>(_cachedDemoMode);

  useEffect(() => {
    const handler = (v: boolean) => setIsDemoMode(v);
    _listeners.add(handler);
    return () => { _listeners.delete(handler); };
  }, []);

  useEffect(() => {
    if (_cachedDemoMode !== null) {
      setIsDemoMode(_cachedDemoMode);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    supabase
      .from("config_flags")
      .select("*")
      .eq("key", "demo_mode")
      .single()
      .then((result) => {
        const data = result.data as ConfigFlagRow | null;
        if (!data) {
          notifyListeners(true);
          return;
        }
        const enabled = (data.value as { enabled: boolean }).enabled;
        notifyListeners(enabled);
      });
  }, []);

  const toggleDemoMode = useCallback(async (enabled: boolean) => {
    // Optimistic update
    notifyListeners(enabled);
    setStoreDemoMode(enabled);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("config_flags")
      .upsert({ key: "demo_mode", value: { enabled } } as never);

    if (error) {
      console.error("Failed to toggle demo mode:", error);
      // Revert
      notifyListeners(!enabled);
      setStoreDemoMode(!enabled);
    }
  }, []);

  return { isDemoMode, toggleDemoMode };
}

export function useSupabaseHydration(isDemoMode: boolean | null) {
  const [creatives, setCreatives] = useState<Creative[] | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);

  useEffect(() => {
    if (isDemoMode !== false) return;

    Promise.all([
      fetch("/api/creatives").then((r) => r.json()),
      fetch("/api/campaigns").then((r) => r.json()),
    ]).then(([creativesData, campaignsData]) => {
      if (Array.isArray(creativesData)) {
        setCreatives((creativesData as CreativeRow[]).map(creativeRowToApp));
      }
      if (Array.isArray(campaignsData)) {
        setCampaigns((campaignsData as CampaignRow[]).map(campaignRowToApp));
      }
    }).catch((err) => {
      console.error("Failed to hydrate from Supabase:", err);
    });
  }, [isDemoMode]);

  return { creatives, campaigns };
}
