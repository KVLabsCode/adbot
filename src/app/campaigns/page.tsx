"use client";

import { useStore } from "@/store";
import { useRouter } from "next/navigation";
import { CampaignsTable } from "@/components/campaign/CampaignsTable";
import { CampaignSheet } from "@/components/campaign/CampaignSheet";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";

export default function CampaignsPage() {
  const campaigns = useStore((s) => s.campaigns);
  const selectedId = useStore((s) => s.selectedCampaignId);
  const selectCampaign = useStore((s) => s.selectCampaign);
  const pauseCampaign = useStore((s) => s.pauseCampaign);
  const resumeCampaign = useStore((s) => s.resumeCampaign);
  const router = useRouter();

  const selected = campaigns.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Campaigns</h2>
        <p className="text-sm text-muted-foreground">
          Manage your active and paused campaigns
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Target className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold mb-1">No campaigns yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Launch your first robot decision campaign from the Studio to start
            influencing how robots choose your brand.
          </p>
          <Button onClick={() => router.push("/studio")}>
            Go to Studio
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <CampaignsTable
            campaigns={campaigns}
            onSelect={(id) => selectCampaign(id)}
          />
        </div>
      )}

      <CampaignSheet
        campaign={selected}
        open={!!selected}
        onClose={() => selectCampaign(null)}
        onPause={pauseCampaign}
        onResume={resumeCampaign}
      />
    </div>
  );
}
