"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PropertyActions({ shareSlug }: { shareSlug: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/share/${shareSlug}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleCopy}>
        {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
        Copy Link
      </Button>
      <Link
        href={`/share/${shareSlug}`}
        target="_blank"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <ExternalLink className="mr-1 h-4 w-4" />
        View
      </Link>
    </>
  );
}
