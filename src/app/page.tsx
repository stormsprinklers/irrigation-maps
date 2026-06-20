import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Droplets, Map, Share2, Calculator } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Droplets className="h-5 w-5 text-primary" />
            Irrigation Maps
          </div>
          <div className="flex gap-2">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Sign in
            </Link>
            <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Professional irrigation maps for contractors
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Map zones, calculate flow rates and runtimes, and deliver a polished interactive map
            your customers can reference for years.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
              Create free account
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-20 grid max-w-4xl gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Map className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">Map every zone</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Draw zones on satellite imagery and mark valves and controllers.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">Smart calculations</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              GPM, runtimes, and monthly water estimates based on vegetation and conditions.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">Share with customers</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Send a branded link with an interactive map your customer can explore.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
