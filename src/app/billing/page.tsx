"use client";

import { CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <CreditCard
            className="h-12 w-12 text-muted-foreground"
            aria-hidden="true"
          />
          <h2 className="text-lg font-semibold">Billing</h2>
          <p className="text-sm text-muted-foreground text-center">
            Coming Soon — Billing and payment management will be available in a
            future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
