"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { generateStylizedPropertyImage } from "@/lib/actions/stylize-image";
import { getPropertyImageStatus } from "@/lib/actions/property-image-status";
import type { MapBounds } from "@/types/database";

export type ImageGenerationStatus = "idle" | "generating" | "ready" | "error";

type BackgroundImageContextValue = {
  status: ImageGenerationStatus;
  stylizedImageUrl: string | null;
  error: string | null;
  scheduleImageGeneration: (bounds: MapBounds) => void;
  retryGeneration: () => void;
};

const BackgroundImageContext = createContext<BackgroundImageContextValue | null>(null);

function boundsKey(bounds: MapBounds): string {
  return bounds.flat().map((n) => n.toFixed(6)).join(",");
}

type ProviderProps = {
  propertyId: string;
  initialImageUrl: string | null;
  initialBounds: MapBounds | null;
  children: React.ReactNode;
};

export function BackgroundImageProvider({
  propertyId,
  initialImageUrl,
  initialBounds,
  children,
}: ProviderProps) {
  const [status, setStatus] = useState<ImageGenerationStatus>(
    initialImageUrl ? "ready" : "idle"
  );
  const [stylizedImageUrl, setStylizedImageUrl] = useState<string | null>(initialImageUrl);
  const [error, setError] = useState<string | null>(null);

  const pendingBoundsRef = useRef<MapBounds | null>(initialBounds);
  const lastGeneratedBoundsRef = useRef<string | null>(
    initialImageUrl && initialBounds ? boundsKey(initialBounds) : null
  );
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const result = await getPropertyImageStatus(propertyId);
        if (result.stylizedImageUrl) {
          setStylizedImageUrl(result.stylizedImageUrl);
          setStatus("ready");
          setError(null);
          if (result.mapBounds) {
            lastGeneratedBoundsRef.current = boundsKey(result.mapBounds);
          }
          stopPolling();
        }
      } catch {
        // Keep polling while generation may still be running server-side
      }
    }, 4000);
  }, [propertyId, stopPolling]);

  const runGeneration = useCallback(
    async (bounds: MapBounds) => {
      const key = boundsKey(bounds);
      if (lastGeneratedBoundsRef.current === key) {
        return;
      }

      const requestId = ++requestIdRef.current;
      setStatus("generating");
      setError(null);
      startPolling();

      try {
        const result = await generateStylizedPropertyImage(propertyId, bounds);
        if (requestId !== requestIdRef.current) return;

        setStylizedImageUrl(result.stylizedImageUrl);
        lastGeneratedBoundsRef.current = key;
        setStatus("ready");
        setError(null);
        stopPolling();
      } catch (e) {
        if (requestId !== requestIdRef.current) return;
        setStatus("error");
        setError(e instanceof Error ? e.message : "Failed to generate image");
        stopPolling();
      }
    },
    [propertyId, startPolling, stopPolling]
  );

  const scheduleImageGeneration = useCallback(
    (bounds: MapBounds) => {
      pendingBoundsRef.current = bounds;
      const key = boundsKey(bounds);

      if (lastGeneratedBoundsRef.current === key) {
        setStatus("ready");
        return;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        runGeneration(bounds);
      }, 1500);
    },
    [runGeneration]
  );

  const retryGeneration = useCallback(() => {
    const bounds = pendingBoundsRef.current;
    if (!bounds) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runGeneration(bounds);
  }, [runGeneration]);

  useEffect(() => {
    if (initialImageUrl) {
      setStylizedImageUrl(initialImageUrl);
      setStatus("ready");
      if (initialBounds) {
        lastGeneratedBoundsRef.current = boundsKey(initialBounds);
        pendingBoundsRef.current = initialBounds;
      }
    } else if (initialBounds) {
      pendingBoundsRef.current = initialBounds;
      scheduleImageGeneration(initialBounds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      stopPolling();
    };
  }, [stopPolling]);

  return (
    <BackgroundImageContext.Provider
      value={{
        status,
        stylizedImageUrl,
        error,
        scheduleImageGeneration,
        retryGeneration,
      }}
    >
      {children}
    </BackgroundImageContext.Provider>
  );
}

export function useBackgroundImageGeneration() {
  const ctx = useContext(BackgroundImageContext);
  if (!ctx) {
    throw new Error("useBackgroundImageGeneration must be used within BackgroundImageProvider");
  }
  return ctx;
}
