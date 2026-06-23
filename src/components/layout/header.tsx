import Link from "next/link";
import { Droplets } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Droplets className="h-5 w-5 text-primary" />
          Irrigation Maps
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Dashboard
          </Link>
          <Link href="/settings" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Settings
          </Link>
          <form action={signOutAction}>
            <Button variant="outline" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </nav>
      </div>
    </header>
  );
}

export function PublicHeader({ companyName }: { companyName?: string | null }) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-primary" />
          <span className="font-semibold">{companyName ?? "Irrigation Maps"}</span>
        </div>
        <span className="text-sm text-muted-foreground">Irrigation System Map</span>
      </div>
    </header>
  );
}
