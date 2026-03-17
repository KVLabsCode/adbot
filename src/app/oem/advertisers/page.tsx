"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  Search,
  ArrowUpRight,
  Copy,
  Check,
  Mail,
  Building2,
} from "lucide-react";
import { oemAdvertisers, type OemAdvertiser } from "@/fixtures/oem-demo";

type StatusFilter = "all" | "active" | "invited" | "paused";

export default function AdvertisersPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCompany, setInviteCompany] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const filtered = oemAdvertisers.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCount = oemAdvertisers.filter((a) => a.status === "active").length;
  const invitedCount = oemAdvertisers.filter((a) => a.status === "invited").length;
  const pausedCount = oemAdvertisers.filter((a) => a.status === "paused").length;

  const handleInvite = () => {
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setInviteOpen(false);
      setInviteEmail("");
      setInviteCompany("");
    }, 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://app.kovio.ai/a/adv-new");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Advertisers</h1>
          <p className="text-sm text-muted-foreground">
            Manage the advertisers monetising your delivery fleet
          </p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Advertiser
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Advertiser</DialogTitle>
              <DialogDescription>
                Send an invitation to onboard a new advertiser into your fleet network.
              </DialogDescription>
            </DialogHeader>
            {inviteSent ? (
              <div className="py-8 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 mx-auto">
                  <Check className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-sm font-medium">Invitation Sent</p>
                <p className="text-xs text-muted-foreground">
                  {inviteEmail || "advertiser"} will receive an invite link shortly.
                </p>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. Nike, McDonald's"
                      value={inviteCompany}
                      onChange={(e) => setInviteCompany(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="campaigns@company.com"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                  <p className="text-xs font-medium">Or share invite link</p>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value="https://app.kovio.ai/a/adv-new"
                      className="text-xs font-mono bg-background"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="shrink-0"
                    >
                      {copiedLink ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {!inviteSent && (
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Send Invitation
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Active" count={activeCount} color="text-emerald-500" bg="bg-emerald-500/10" />
        <SummaryCard label="Invited" count={invitedCount} color="text-amber-500" bg="bg-amber-500/10" />
        <SummaryCard label="Paused" count={pausedCount} color="text-muted-foreground" bg="bg-muted" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search advertisers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="invited">Invited</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Advertiser</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Campaigns</TableHead>
                <TableHead className="text-right">Total Spend</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Joined</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((adv) => (
                <TableRow key={adv.id} className="group">
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
                  <TableCell className="text-right font-mono text-sm">
                    {adv.activeCampaigns}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    ${adv.totalSpend.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {adv.totalImpressions > 0
                      ? adv.totalImpressions.toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-emerald-500">
                    {adv.revenueGenerated > 0
                      ? `$${adv.revenueGenerated.toLocaleString()}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {new Date(adv.joinedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/oem/advertiser/${adv.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-sm text-muted-foreground">
                    No advertisers match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SummaryCard({
  label,
  count,
  color,
  bg,
}: {
  label: string;
  count: number;
  color: string;
  bg: string;
}) {
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

function StatusBadge({ status }: { status: OemAdvertiser["status"] }) {
  switch (status) {
    case "active":
      return (
        <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5 text-[11px]">
          Active
        </Badge>
      );
    case "invited":
      return (
        <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/5 text-[11px]">
          Invited
        </Badge>
      );
    case "paused":
      return (
        <Badge variant="outline" className="text-muted-foreground border-border text-[11px]">
          Paused
        </Badge>
      );
  }
}
