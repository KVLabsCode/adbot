"use client";

import { useState, useCallback } from "react";
import { useStore } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Calendar,
  FileImage,
  Inbox,
  Bot,
  Sparkles,
} from "lucide-react";
import { getOemById, getMomentById } from "@/fixtures/oem-partners";
import type { ApprovalQueueItem } from "@/types";

type FilterTab = "pending" | "all";

export default function FleetApprovalsPage() {
  const approvalQueue = useStore((s) => s.approvalQueue);
  const approveCampaign = useStore((s) => s.approveCampaign);
  const rejectCampaign = useStore((s) => s.rejectCampaign);

  const [tab, setTab] = useState<FilterTab>("pending");
  const [rejectDialogItem, setRejectDialogItem] = useState<ApprovalQueueItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered =
    tab === "pending"
      ? approvalQueue.filter((q) => q.campaign.status === "pending_approval")
      : approvalQueue;

  const handleApprove = useCallback(
    (campaignId: string) => {
      approveCampaign(campaignId);
    },
    [approveCampaign]
  );

  const handleRejectConfirm = useCallback(() => {
    if (!rejectDialogItem || !rejectReason.trim()) return;
    rejectCampaign(rejectDialogItem.campaign.id, rejectReason.trim());
    setRejectDialogItem(null);
    setRejectReason("");
  }, [rejectDialogItem, rejectReason, rejectCampaign]);

  const handleRejectCancel = useCallback(() => {
    setRejectDialogItem(null);
    setRejectReason("");
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Campaign Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve campaigns targeting your robot fleet.
        </p>
      </div>

      {/* Filter tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Pending
            {approvalQueue.filter((q) => q.campaign.status === "pending_approval").length > 0 && (
              <Badge className="ml-1 h-5 min-w-5 px-1.5 text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30">
                {approvalQueue.filter((q) => q.campaign.status === "pending_approval").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-1.5">
            All
            <Badge className="ml-1 h-5 min-w-5 px-1.5 text-[10px]" variant="outline">
              {approvalQueue.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Queue */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
              <Inbox className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No campaigns pending approval</p>
            <p className="text-xs text-muted-foreground mt-1">
              New campaigns targeting your fleet will appear here for review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <ApprovalCard
              key={item.campaign.id}
              item={item}
              onApprove={handleApprove}
              onReject={setRejectDialogItem}
            />
          ))}
        </div>
      )}

      {/* Reject reason dialog */}
      <Dialog
        open={rejectDialogItem !== null}
        onOpenChange={(open) => {
          if (!open) handleRejectCancel();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Campaign</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting &ldquo;
              {rejectDialogItem?.campaign.name}&rdquo; by{" "}
              {rejectDialogItem?.advertiserName}. The advertiser will see this
              feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-xs font-medium text-muted-foreground">
              Rejection reason
            </label>
            <Input
              placeholder="e.g. Creative violates content policy..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleRejectCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleRejectConfirm}
              disabled={!rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reject Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Approval Card ──────────────────────────────────────────────────────────

function ApprovalCard({
  item,
  onApprove,
  onReject,
}: {
  item: ApprovalQueueItem;
  onApprove: (id: string) => void;
  onReject: (item: ApprovalQueueItem) => void;
}) {
  const oem = getOemById(item.campaign.oemId);
  const moment = getMomentById(item.campaign.placementMomentId);

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        {/* Top row — campaign name + advertiser */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{item.campaign.name}</h3>
              <Badge
                variant="outline"
                className="text-amber-500 border-amber-500/30 bg-amber-500/5 text-[10px]"
              >
                Pending
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              by <span className="font-medium text-foreground">{item.advertiserName}</span>
              {" "}-- submitted{" "}
              {new Date(item.submittedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => onApprove(item.campaign.id)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(item)}
              className="text-red-500 border-red-500/30 hover:bg-red-500/10 gap-1.5"
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </Button>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          {/* Robot type + OEM */}
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Robot / OEM</p>
              <p className="text-sm font-medium">
                {oem?.name ?? item.campaign.oemId}
              </p>
            </div>
          </div>

          {/* Moment type */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Moment</p>
              <p className="text-sm font-medium">
                {moment?.label ?? item.campaign.placementMomentId}
              </p>
            </div>
          </div>

          {/* Budget */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="font-[family-name:var(--font-geist-mono)] text-sm font-medium">
                ${item.campaign.budget.toLocaleString()}{" "}
                <span className="text-xs text-muted-foreground">
                  ({item.campaign.budgetType})
                </span>
              </p>
            </div>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Schedule</p>
              <p className="text-sm font-medium">
                {item.campaign.schedule
                  ? `${formatDate(item.campaign.schedule.startDate)} - ${formatDate(item.campaign.schedule.endDate)}`
                  : "No schedule"}
              </p>
            </div>
          </div>
        </div>

        {/* Bidding model */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Bidding model:</span>
          <Badge variant="outline" className="text-[10px]">
            {item.campaign.biddingModel.toUpperCase()}
          </Badge>
        </div>

        {/* Creatives */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileImage className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Creatives ({item.creatives.length})
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {item.creatives.map((cr) => (
              <div
                key={cr.id}
                className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted shrink-0">
                  <FileImage className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{cr.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatTypeName(cr.formatType)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-flags */}
        {item.autoFlags.length > 0 && (
          <div className="space-y-2">
            {item.autoFlags.map((flag, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3"
              >
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200">{flag}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTypeName(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
