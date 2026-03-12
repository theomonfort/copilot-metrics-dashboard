"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, Code, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: Users },
  { label: "Languages & IDE", href: "/languages", icon: Code },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 rounded-md p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-16 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--background))] transition-transform duration-200 md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button – mobile only */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-2 top-3 rounded-md p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] md:hidden"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Branding */}
        <div className="flex h-14 items-center justify-center border-b border-[hsl(var(--border))]">
          <svg
            viewBox="0 0 16 16"
            className="h-6 w-6 text-white"
            fill="currentColor"
          >
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
          </svg>
        </div>

        {/* Org badge */}
        <div className="flex h-10 items-center justify-center border-b border-[hsl(var(--border))]">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            octo
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col items-center gap-1 pt-3">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                title={label}
                className={cn(
                  "group relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                  isActive
                    ? "bg-[hsl(var(--accent))] text-white"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-full ml-2 hidden rounded-md bg-[hsl(var(--popover))] px-2 py-1 text-xs font-medium text-[hsl(var(--popover-foreground))] shadow-lg ring-1 ring-[hsl(var(--border))] group-hover:block">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
