"use client";

import Image from "next/image";
import { Loader2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { useBackgroundImageGeneration } from "@/components/wizard/BackgroundImageGeneration";
import { Button } from "@/components/ui/button";

export function PresentationImageBanner() {
  const { status, stylizedImageUrl, error, retryGeneration } = useBackgroundImageGeneration();

  if (status === "idle") return null;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center">
      {status === "generating" && (
        <>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-background">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Creating presentation image</p>
            <p className="text-xs text-muted-foreground">
              OpenAI is rendering your property aerial in the background — keep working on zones.
            </p>
          </div>
        </>
      )}

      {status === "ready" && stylizedImageUrl && (
        <>
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border">
            <Image
              src={stylizedImageUrl}
              alt="Property preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-1 items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">Presentation image ready for customer share page</p>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Image generation failed</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={retryGeneration}>
            <RefreshCw className="mr-1 h-3 w-3" />
            Retry
          </Button>
        </>
      )}
    </div>
  );
}
