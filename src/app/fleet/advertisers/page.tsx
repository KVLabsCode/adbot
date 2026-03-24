"use client";

import { useState, useCallback } from "react";
import { useStore } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ExternalLink,
  Copy,
  Check,
  UserX,
  Users,
  Inbox,
  TrendingUp,
} from "lucide-react";
import type { FleetAdvertiser } from "@/types";

export default function FleetAdvertisersPage() {
  const fleetAdvertisers = useStore((s) => s.fleetAdvertisers);
  const revokeAdvertiser = useStore((s) => s.revokeAdvertiser);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<FleetAdvertiser | null>(null);

  const getRoiLink = useCallback((advId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/a/${advId}`;
  }, []);

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleRevokeConfirm = useCallback(() => {
    if (!revokeTarget) return;
    revokeAdvertiser(revokeTarget.id);
    setRevokeTarget(null);
  }, [revokeTarget, revokeAdvertiser]);

  const activeCount = fleetAdvertisers.filter((a) => a.status === "active").length;
  const invitedCount = fleetAdvertisers.filter((a) => a.status === "invited").length;
  const revokedCount = fleetAdvertisers.filter((a) => a.status === "revoked").length;
  const totalRevenue = fleetAdvertisers
    .filter((a) => a.status === "active")
    .reduce((s, a) => s + a.totalSpend, 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Advertisers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage advertisers on your fleet and share live ROI dashboards.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Active" count={activeCount} color="text-emerald-600" bg="bg-emerald-50" />
        <SummaryCard label="Invited" count={invitedCount} color="text-amber-600" bg="bg-amber-50" />
        <SummaryCard label="Revoked" count={revokedCount} color="text-red-600" bg="bg-red-50" />
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Spend</p>
              <p className="text-lg font-bold font-[family-name:var(--font-geist-mono)]">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advertiser roster */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Advertiser Roster</h2>
        </div>

        {fleetAdvertisers.length === 0 ? (
          <Card>
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                <Inbox className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No advertisers yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Advertisers will appear here once they create campaigns on your fleet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Advertiser</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Since</TableHead>
                    <TableHead className="text-right">Campaigns</TableHead>
                    <TableHead className="text-right">Total Spend</TableHead>
                    <TableHead className="text-right">ROI Dashboard</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fleetAdvertisers.map((adv) => {
                    const roiUrl = getRoiLink(adv.id);
                    const hasData = adv.totalSpend > 0;

                    return (
                      <TableRow key={adv.id} className="group">
                        {/* Logo + name */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0"
                              style={{ backgroundColor: adv.accentColor }}
                            >
                              {adv.logoInitials}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{adv.name}</p>
                              <p className="text-xs text-muted-foreground">{adv.email}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <StatusBadge status={adv.status} />
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(adv.invitedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>

                        <TableCell className="text-right font-[family-name:var(--font-geist-mono)] text-sm">
                          {adv.activeCampaigns}
                        </TableCell>

                        <TableCell className="text-right font-[family-name:var(--font-geist-mono)] text-sm font-medium">
                          ${adv.totalSpend.toLocaleString()}
                        </TableCell>

                        {/* Share ROI link */}
                        <TableCell className="text-right">
                          {hasData ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={`/a/${adv.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-600 hover:text-indigo-700 underline underline-offset-2 flex items-center gap-1"
                              >
                                View
                                <ExternalLink className="h-3 w-3" />
                              </a>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1 text-xs"
                                onClick={() => copyToClipboard(roiUrl, adv.id)}
                              >
                                {copiedId === adv.id ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-600" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    Copy Link
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No data yet</span>
                          )}
                        </TableCell>

                        {/* Revoke */}
                        <TableCell>
                          {adv.status === "active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setRevokeTarget(adv)}
                            >
                              <UserX className="h-3.5 w-3.5" />
                              Revoke
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Revoke dialog */}
      <Dialog open={revokeTarget !== null} onOpenChange={(open) => { if (!open) setRevokeTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Revoke Advertiser Access</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke access for{" "}
              <span className="font-medium text-foreground">{revokeTarget?.name}</span>?
              Their active campaigns will be paused.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeTarget(null)}>Cancel</Button>
            <Button onClick={handleRevokeConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              Revoke Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
          <span className={`text-lg font-bold ${color}`}>{count}</span>
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: FleetAdvertiser["status"] }) {
  switch (status) {
    case "active":
      return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-[11px]">Active</Badge>;
    case "invited":
      return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-[11px]">Invited</Badge>;
    case "revoked":
      return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 text-[11px]">Revoked</Badge>;
  }
}
