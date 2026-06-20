"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createProperty } from "@/lib/actions/properties";
import { Button } from "@/components/ui/button";

export function CreatePropertyButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    startTransition(async () => {
      const property = await createProperty();
      router.push(`/properties/${property.id}/edit`);
    });
  }

  return (
    <Button onClick={handleCreate} disabled={isPending}>
      <Plus className="mr-1 h-4 w-4" />
      {isPending ? "Creating..." : "New Property"}
    </Button>
  );
}
