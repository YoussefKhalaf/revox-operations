"use client";

import Link from "next/link";
import { useState } from "react";
import { signOutAction } from "@/app/actions/auth";
import type { AppUser } from "@/lib/auth/types";
import type { NavItem } from "@/lib/auth/navigation";

type AppShellProps = {
  children: React.ReactNode;
  user: AppUser;
  navItems: NavItem[];
};

function NavList({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.label}>
          {item.href ? (
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={item.active ? "page" : undefined}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                item.active
                  ? "bg-accent text-white"
                  : "text-muted hover:bg-surface-hover"
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="block cursor-not-allowed rounded-md px-3 py-2 text-sm font-medium text-muted/50"
            >
              {item.label}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function AppShell({ children, user, navItems }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-full bg-background">
      <aside
        aria-label="Main navigation"
        className="hidden w-56 shrink-0 border-r border-border bg-card md:block"
      >
        <div className="border-b border-border px-4 py-4">
          <p className="text-sm font-semibold text-foreground">REVOX Operations</p>
          <p className="text-xs text-muted">Internal Management</p>
        </div>
        <nav className="p-3">
          <NavList items={navItems} />
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-card">
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-expanded={mobileNavOpen}
                aria-controls="mobile-nav"
                aria-label={
                  mobileNavOpen ? "Close navigation menu" : "Open navigation menu"
                }
                className="rounded-md border border-border p-2 text-foreground md:hidden"
                onClick={() => setMobileNavOpen((open) => !open)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  {mobileNavOpen ? (
                    <>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </>
                  ) : (
                    <>
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </>
                  )}
                </svg>
              </button>
              <div>
                <h1 className="text-base font-semibold text-foreground">
                  REVOX Operations
                </h1>
                <p className="text-xs text-muted">Internal Management System</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-foreground">{user.fullName}</p>
                <p className="text-xs text-muted">{user.roleLabel}</p>
              </div>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>

          {mobileNavOpen && (
            <nav
              id="mobile-nav"
              aria-label="Mobile navigation"
              className="border-t border-border p-3 md:hidden"
            >
              <NavList
                items={navItems}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </nav>
          )}
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
