import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", num: "01" },
  { to: "/projects", label: "Projects", num: "02" },
  { to: "/templates", label: "Templates", num: "03" },
  { to: "/integrations", label: "Integrations", num: "04" },
  { to: "/settings", label: "Settings", num: "05" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-[220px_1fr] bg-background text-foreground">
      <aside className="hairline-r hidden md:flex flex-col sticky top-0 h-screen">
        <div className="hairline-b px-5 py-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Alat QA</div>
          <div className="mt-2 text-[15px] font-bold leading-tight">
            AI Test<br />Scenario<br />Generator
          </div>
        </div>
        <nav className="flex-1 py-4">
          {nav.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  "flex items-baseline gap-3 px-5 py-2.5 text-[13px] hairline-b " +
                  (active
                    ? "bg-foreground text-background font-semibold"
                    : "hover:bg-secondary")
                }
              >
                <span className="font-mono text-[10px] opacity-60 w-5">{item.num}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="hairline-t px-5 py-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          v0.9.3 — Prototipe
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden hairline-b flex items-center justify-between px-4 py-3">
        <div className="text-sm font-bold">AI Test Scenario Generator</div>
      </div>
      <div className="md:hidden hairline-b flex overflow-x-auto">
        {nav.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={
                "px-4 py-3 text-xs shrink-0 " +
                (active ? "bg-foreground text-background font-semibold" : "")
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <main className="min-w-0">{children}</main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="hairline-b px-6 md:px-10 py-8 md:py-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        <div className="md:col-span-8 min-w-0">
          {eyebrow && (
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-3">
              {eyebrow}
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-bold leading-[0.95] tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="md:col-span-4 flex md:justify-end gap-2">{actions}</div>}
      </div>
    </div>
  );
}
