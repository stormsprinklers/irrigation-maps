import Link from "next/link";
import { CloudRain, Phone, Mail, Calendar, Shield } from "lucide-react";
import { STORM_SPRINKLERS } from "@/lib/branding/storm-sprinklers";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StormSprinklersFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "mt-auto border-t bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100",
        className
      )}
    >
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <Link
              href={STORM_SPRINKLERS.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-lg font-semibold text-white"
            >
              <CloudRain className="h-6 w-6 text-sky-400" />
              {STORM_SPRINKLERS.name}
            </Link>
            <p className="text-sm text-slate-300">{STORM_SPRINKLERS.tagline}</p>
            <p className="text-xs text-slate-400">{STORM_SPRINKLERS.subtagline}</p>
            <p className="text-xs text-slate-500">{STORM_SPRINKLERS.serviceArea}</p>
          </div>

          <div className="space-y-2 text-sm">
            <a
              href={STORM_SPRINKLERS.phoneHref}
              className="flex items-center gap-2 text-slate-200 hover:text-white"
            >
              <Phone className="h-4 w-4 text-sky-400" />
              {STORM_SPRINKLERS.phone}
            </a>
            <a
              href={STORM_SPRINKLERS.emailHref}
              className="flex items-center gap-2 text-slate-200 hover:text-white"
            >
              <Mail className="h-4 w-4 text-sky-400" />
              {STORM_SPRINKLERS.email}
            </a>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
            <Link
              href={STORM_SPRINKLERS.bookOnlineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-sky-500 text-white hover:bg-sky-400"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Book Online
            </Link>
            <Link
              href={STORM_SPRINKLERS.maintenancePlansUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-slate-600 bg-transparent text-slate-100 hover:bg-slate-800"
              )}
            >
              <Shield className="mr-2 h-4 w-4" />
              Maintenance Plans
            </Link>
          </div>
        </div>

        <p className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          Your irrigation map is provided by{" "}
          <Link
            href={STORM_SPRINKLERS.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline"
          >
            Storm Sprinklers
          </Link>
          . Schedule service anytime — we&apos;re here to keep your system running strong.
        </p>
      </div>
    </footer>
  );
}

export function StormSprinklersHeader() {
  return (
    <header className="border-b bg-slate-950 text-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link
          href={STORM_SPRINKLERS.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-semibold"
        >
          <CloudRain className="h-5 w-5 text-sky-400" />
          {STORM_SPRINKLERS.name}
        </Link>
        <div className="hidden items-center gap-4 text-sm text-slate-300 sm:flex">
          <a href={STORM_SPRINKLERS.phoneHref} className="hover:text-white">
            {STORM_SPRINKLERS.phone}
          </a>
          <Link
            href={STORM_SPRINKLERS.bookOnlineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline"
          >
            Book Online
          </Link>
        </div>
      </div>
    </header>
  );
}
