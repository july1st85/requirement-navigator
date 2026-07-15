import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — AI Test Scenario Generator" },
      { name: "description", content: "Koneksi ke Jira, TestRail, dan Xray." },
    ],
  }),
  component: IntegrationsPage,
});

interface Integ {
  id: string;
  name: string;
  desc: string;
  connected: boolean;
  workspace?: string;
}

const seed: Integ[] = [
  { id: "jira", name: "Jira", desc: "Sinkronisasi issue dan sub-task test.", connected: true, workspace: "qa-team.atlassian.net" },
  { id: "testrail", name: "TestRail", desc: "Kirim test scenario ke test suite.", connected: false },
  { id: "xray", name: "Xray for Jira", desc: "Manajemen test execution & report.", connected: true, workspace: "PROJ-XR" },
  { id: "github", name: "GitHub", desc: "Simpan skenario Gherkin di repo.", connected: false },
  { id: "slack", name: "Slack", desc: "Notifikasi hasil generate ke channel.", connected: true, workspace: "#qa-updates" },
];

function IntegrationsPage() {
  const [items, setItems] = useState<Integ[]>(seed);

  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              connected: !i.connected,
              workspace: !i.connected ? "workspace-baru" : undefined,
            }
          : i,
      ),
    );

  return (
    <AppShell>
      <PageHeader
        eyebrow="04 / Integrations"
        title="Hubungkan alat kerja."
        description="Alirkan test scenario dari sini ke sistem manajemen test dan issue tracker tim."
      />

      <section className="grid grid-cols-1 md:grid-cols-2">
        {items.map((it, i) => (
          <article
            key={it.id}
            className={
              "px-6 md:px-10 py-8 hairline-b " + (i % 2 === 0 ? "md:hairline-r" : "")
            }
          >
            <div className="grid grid-cols-[1fr_auto] items-start gap-4">
              <div className="min-w-0">
                <div className="flex items-baseline gap-3 mb-2">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground w-8">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">{it.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground max-w-md">{it.desc}</p>

                <div className="mt-5 flex items-center gap-3">
                  <span
                    className={
                      "inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest " +
                      (it.connected ? "text-foreground" : "text-muted-foreground")
                    }
                  >
                    <span
                      className={
                        "inline-block w-2 h-2 " +
                        (it.connected ? "bg-foreground" : "bg-border")
                      }
                    />
                    {it.connected ? "Terhubung" : "Belum terhubung"}
                  </span>
                  {it.workspace && (
                    <span className="font-mono text-xs text-muted-foreground">
                      → {it.workspace}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => toggle(it.id)}
                  className={
                    "px-4 py-2 text-xs font-semibold uppercase tracking-widest " +
                    (it.connected
                      ? "border border-foreground"
                      : "bg-foreground text-background")
                  }
                >
                  {it.connected ? "Putuskan" : "Hubungkan"}
                </button>
                <button className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:underline">
                  Atur →
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
