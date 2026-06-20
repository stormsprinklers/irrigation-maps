"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink } from "lucide-react";
import { publishProperty } from "@/lib/actions/properties";
import { calculatePropertyTotalGpm, getGpmWarnings } from "@/lib/calculations/gpm";
import { formatRuntime, calculatePropertyStartTimes } from "@/lib/calculations/runtime";
import {
  calculatePropertyMonthlyGallons,
  calculateZoneWaterUsage,
  formatGallons,
} from "@/lib/calculations/water-usage";
import { labelForEnum } from "@/components/map/zone-layer";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { PropertyWithRelations } from "@/types/database";

type StepReviewProps = {
  property: PropertyWithRelations;
};

export function StepReview({ property }: StepReviewProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(
    property.share_slug
      ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/share/${property.share_slug}`
      : null
  );
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalGpm = calculatePropertyTotalGpm(
    property.zones.map((z) => z.estimated_gpm ?? 0)
  );
  const warnings = getGpmWarnings(property.zones);
  const usages = property.zones
    .map((z) => calculateZoneWaterUsage(z))
    .filter((u): u is NonNullable<typeof u> => u != null);
  const monthlyTotal = calculatePropertyMonthlyGallons(usages);
  const zoneStartTimes = calculatePropertyStartTimes(property.zones);

  function handlePublish() {
    startTransition(async () => {
      try {
        const url = await publishProperty(property.id);
        setShareUrl(url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to publish");
      }
    });
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Property</p>
          <p className="font-medium">{property.address}</p>
          {property.customer_name && (
            <p className="text-sm text-muted-foreground">{property.customer_name}</p>
          )}
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total flow</p>
          <p className="text-2xl font-bold">{totalGpm} GPM</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Est. monthly usage</p>
          <p className="text-2xl font-bold">{formatGallons(monthlyTotal)}</p>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Flow warnings
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-amber-700 dark:text-amber-300">
            {warnings.map((w) => (
              <li key={w.zoneName}>
                {w.zoneName}: {w.gpm} GPM — {w.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Zone</TableHead>
            <TableHead>Vegetation</TableHead>
            <TableHead>Shade</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">GPM</TableHead>
            <TableHead className="text-right">Runtime</TableHead>
            <TableHead className="text-right">Days/wk</TableHead>
            <TableHead className="text-right">Start</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {property.zones.map((zone) => {
            const usage = usages.find((u) => u.zoneId === zone.id);
            const timing = zoneStartTimes.get(zone.id);
            return (
            <TableRow key={zone.id}>
              <TableCell className="font-medium">{zone.name}</TableCell>
              <TableCell>{labelForEnum(zone.vegetation_type)}</TableCell>
              <TableCell>{labelForEnum(zone.shade_level)}</TableCell>
              <TableCell>{labelForEnum(zone.irrigation_type)}</TableCell>
              <TableCell className="text-right">{zone.estimated_gpm ?? "—"}</TableCell>
              <TableCell className="text-right">
                {zone.base_runtime_minutes
                  ? formatRuntime(zone.base_runtime_minutes)
                  : "—"}
              </TableCell>
              <TableCell className="text-right">{usage?.daysPerWeek ?? "—"}</TableCell>
              <TableCell className="text-right">{timing?.startTime ?? "—"}</TableCell>
            </TableRow>
          );
          })}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center gap-3">
        {property.status !== "published" ? (
          <Button onClick={handlePublish} disabled={isPending}>
            {isPending ? "Publishing..." : "Publish & Generate Share Link"}
          </Button>
        ) : (
          <Badge variant="secondary">Published</Badge>
        )}

        {shareUrl && (
          <>
            <div className="flex flex-1 items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm">
              <span className="truncate">{shareUrl}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Link
              href={`/share/${property.share_slug}`}
              target="_blank"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
