import Link from "next/link";
import { MapPin, Pencil } from "lucide-react";
import { getDashboardProperties } from "@/lib/actions/properties";
import { AppHeader } from "@/components/layout/header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreatePropertyButton } from "@/components/dashboard/create-property-button";
import { PropertyActions } from "@/components/dashboard/property-actions";
import { RemovePropertyButton } from "@/components/dashboard/remove-property-button";

export default async function DashboardPage() {
  let properties: Awaited<ReturnType<typeof getDashboardProperties>> = [];
  let setupError: string | null = null;

  try {
    properties = await getDashboardProperties();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load properties";
    if (message.includes("properties") && message.includes("schema cache")) {
      setupError =
        "Database tables are missing. Run supabase/setup.sql in your Supabase SQL Editor, then refresh this page.";
    } else {
      throw e;
    }
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        {setupError && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-base">Database setup required</CardTitle>
              <CardDescription>{setupError}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Supabase → SQL Editor → paste the contents of{" "}
              <code className="rounded bg-muted px-1">supabase/setup.sql</code> → Run
            </CardContent>
          </Card>
        )}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your Properties</h1>
            <p className="text-muted-foreground">
              Create and manage irrigation maps for your customers
            </p>
          </div>
          <CreatePropertyButton />
        </div>

        {properties.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="text-lg font-medium">No properties yet</h2>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                Create your first irrigation map to generate a professional share link for your
                customer.
              </p>
              <CreatePropertyButton />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {properties.map((property) => (
              <Card key={property.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg">{property.address}</CardTitle>
                    {property.customer_name && (
                      <CardDescription>{property.customer_name}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={property.status === "published" ? "default" : "secondary"}>
                      {property.status === "published" ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant="outline">Step {property.wizard_step}/5</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/properties/${property.id}/edit`}
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    <Pencil className="mr-1 h-4 w-4" />
                    {property.status === "published" ? "Edit" : "Continue"}
                  </Link>
                  {property.share_slug && (
                    <PropertyActions shareSlug={property.share_slug} />
                  )}
                  <RemovePropertyButton propertyId={property.id} address={property.address} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
