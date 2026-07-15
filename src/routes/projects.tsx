import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useStore, type ProjectStatus } from "@/lib/store";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — AI Test Scenario Generator" },
      { name: "description", content: "Daftar seluruh project test scenario." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { projects, archiveProject } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"Semua" | ProjectStatus>("Semua");
  const [showArchived, setShowArchived] = useState(false);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (!showArchived && p.archived) return false;
      if (showArchived && !p.archived) return false;
      if (status !== "Semua" && p.status !== status) return false;
      if (q && !`${p.name} ${p.id} ${p.domain}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [projects, q, status, showArchived]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="02 / Projects"
        title="Semua project."
        description="Satu project mewakili satu dokumen requirement. Cari, filter, atau arsipkan."
      />

      <section className="hairline-b px-6 md:px-10 py-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari berdasarkan nama, ID, atau domain..."
          className="border border-foreground px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus | "Semua")}
          className="border border-foreground px-3 py-2 text-sm bg-background"
        >
          <option>Semua</option>
          <option>Draft</option>
          <option>Direview</option>
          <option>Selesai</option>
        </select>
        <button
          onClick={() => setShowArchived((v) => !v)}
          className={
            "px-3 py-2 text-sm border border-foreground " +
            (showArchived ? "bg-foreground text-background" : "")
          }
        >
          {showArchived ? "Sedang: Arsip" : "Aktif"}
        </button>
        <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground self-center md:pl-2">
          {String(filtered.length).padStart(2, "0")} project
        </div>
      </section>

      <section>
        <div className="grid grid-cols-12 gap-4 px-6 md:px-10 py-3 hairline-b text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <div className="col-span-2 md:col-span-1">ID</div>
          <div className="col-span-6 md:col-span-4">Nama</div>
          <div className="hidden md:block md:col-span-2">Domain</div>
          <div className="hidden md:block md:col-span-2">Langkah</div>
          <div className="col-span-3 md:col-span-2">Status</div>
          <div className="col-span-1 text-right">Aksi</div>
        </div>

        {filtered.length === 0 && (
          <div className="px-6 md:px-10 py-16 text-center text-sm text-muted-foreground">
            Tidak ada project yang cocok dengan filter.
          </div>
        )}

        {filtered.map((p) => (
          <div key={p.id} className="grid grid-cols-12 gap-4 px-6 md:px-10 py-4 hairline-b items-center">
            <div className="col-span-2 md:col-span-1 font-mono text-xs text-muted-foreground">{p.id}</div>
            <div className="col-span-6 md:col-span-4 min-w-0">
              <Link
                to="/projects/$projectId"
                params={{ projectId: p.id }}
                className="font-semibold hover:underline underline-offset-4 truncate block"
              >
                {p.name}
              </Link>
              <div className="text-xs text-muted-foreground mt-0.5 md:hidden">{p.domain}</div>
            </div>
            <div className="hidden md:block md:col-span-2 text-sm">{p.domain}</div>
            <div className="hidden md:block md:col-span-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className={"h-1.5 flex-1 " + (s <= p.currentStep ? "bg-foreground" : "bg-border")} />
                ))}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                {p.currentStep}/5 · {p.updatedAt}
              </div>
            </div>
            <div className="col-span-3 md:col-span-2">
              <span
                className={
                  "inline-block px-2 py-1 text-[10px] font-mono uppercase tracking-widest " +
                  (p.status === "Draft"
                    ? "bg-secondary"
                    : p.status === "Direview"
                    ? "bg-accent text-accent-foreground"
                    : "bg-foreground text-background")
                }
              >
                {p.status}
              </span>
            </div>
            <div className="col-span-1 text-right">
              <button
                onClick={() => archiveProject(p.id)}
                title={p.archived ? "Pulihkan" : "Arsipkan"}
                className="text-xs font-mono uppercase tracking-widest hover:underline"
              >
                {p.archived ? "Pulihkan" : "Arsip"}
              </button>
            </div>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
