import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Templates — AI Test Scenario Generator" },
      { name: "description", content: "Template test scenario milik tim." },
    ],
  }),
  component: TemplatesPage,
});

const templates = [
  {
    id: "TPL-01",
    name: "Login & Autentikasi — Standar",
    owner: "Tim QA Core",
    fields: ["ID", "Judul", "Prasyarat", "Langkah", "Ekspektasi", "Sumber REQ"],
    usage: 42,
    updated: "2026-06-30",
  },
  {
    id: "TPL-02",
    name: "Boundary Value — Numerik",
    owner: "Tim Payments",
    fields: ["ID", "Judul", "Nilai Bawah", "Nilai Atas", "Ekspektasi"],
    usage: 27,
    updated: "2026-06-12",
  },
  {
    id: "TPL-03",
    name: "Skenario Keamanan — OWASP Top 10",
    owner: "Tim AppSec",
    fields: ["ID", "Kategori OWASP", "Payload", "Langkah", "Ekspektasi"],
    usage: 18,
    updated: "2026-05-28",
  },
  {
    id: "TPL-04",
    name: "Regression — Rilis Bulanan",
    owner: "Tim QA Core",
    fields: ["ID", "Modul", "Skenario Lama", "Skenario Baru", "Prioritas"],
    usage: 55,
    updated: "2026-07-01",
  },
  {
    id: "TPL-05",
    name: "Performance — Beban Puncak",
    owner: "Tim Platform",
    fields: ["ID", "Metrik", "Threshold", "Beban", "Alat"],
    usage: 9,
    updated: "2026-04-18",
  },
];

function TemplatesPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="03 / Templates"
        title="Template test tim."
        description="Standar penulisan dan format field yang digunakan di seluruh project."
        actions={
          <button className="bg-foreground text-background px-5 py-3 text-sm font-semibold">
            + Template Baru
          </button>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((t, i) => (
          <article
            key={t.id}
            className={
              "px-6 py-6 hairline-b " +
              ((i + 1) % 3 !== 0 ? "lg:hairline-r " : "") +
              ((i + 1) % 2 !== 0 ? "md:hairline-r lg:hairline-r " : "")
            }
          >
            <div className="flex items-baseline justify-between mb-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t.id}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Digunakan {t.usage}×
              </div>
            </div>
            <h3 className="text-lg font-bold leading-tight mb-2">{t.name}</h3>
            <div className="text-xs text-muted-foreground mb-4">
              {t.owner} · Diperbarui {t.updated}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Field</div>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {t.fields.map((f) => (
                <span key={f} className="border border-foreground px-2 py-0.5 text-[11px] font-mono">
                  {f}
                </span>
              ))}
            </div>
            <div className="flex gap-2 pt-4 hairline-t">
              <button className="text-xs font-mono uppercase tracking-widest hover:underline underline-offset-4">
                Lihat
              </button>
              <span className="text-muted-foreground">·</span>
              <button className="text-xs font-mono uppercase tracking-widest hover:underline underline-offset-4">
                Duplikat
              </button>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
