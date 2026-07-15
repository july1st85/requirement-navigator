import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { useStore, type ProjectStatus } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

const statusBadge = (s: ProjectStatus) => {
  if (s === "Draft") return "bg-secondary text-foreground";
  if (s === "Direview") return "bg-accent text-accent-foreground";
  return "bg-foreground text-background";
};

function DashboardPage() {
  const { projects, createProject } = useStore();
  const active = projects.filter((p) => !p.archived);
  const navigate = useNavigate();
  const [openNew, setOpenNew] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("Autentikasi");

  const stats = {
    total: active.length,
    draft: active.filter((p) => p.status === "Draft").length,
    review: active.filter((p) => p.status === "Direview").length,
    done: active.filter((p) => p.status === "Selesai").length,
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const id = createProject(name.trim(), domain);
    setOpenNew(false);
    setName("");
    navigate({ to: "/projects/$projectId", params: { projectId: id } });
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Dashboard / 15.07.2026"
        title="Selamat datang, tim QA."
        description="Lanjutkan pekerjaan yang tertunda atau mulai project baru dari dokumen requirement."
        actions={
          <button
            onClick={() => setOpenNew(true)}
            className="bg-foreground text-background px-6 py-3 text-sm font-semibold hover:bg-foreground/90 w-full md:w-auto"
          >
            + Buat Baru
          </button>
        }
      />

      <section className="grid grid-cols-2 md:grid-cols-4 hairline-b">
        {[
          ["Total Project", stats.total],
          ["Draft", stats.draft],
          ["Direview", stats.review],
          ["Selesai", stats.done],
        ].map(([label, val], i) => (
          <div key={label} className={"px-6 md:px-10 py-6 " + (i < 3 ? "hairline-r" : "")}>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
            <div className="mt-2 text-4xl font-bold tabular-nums">{String(val).padStart(2, "0")}</div>
          </div>
        ))}
      </section>

      <section className="px-6 md:px-10 py-8">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xl font-bold">Project berjalan</h2>
          <Link to="/projects" className="text-xs font-mono uppercase tracking-widest underline underline-offset-4">
            Lihat semua →
          </Link>
        </div>

        <div className="hairline-t">
          {active.slice(0, 5).map((p) => (
            <Link
              key={p.id}
              to="/projects/$projectId"
              params={{ projectId: p.id }}
              className="grid grid-cols-12 gap-4 items-center hairline-b px-4 py-5 hover:bg-secondary group"
            >
              <div className="col-span-2 md:col-span-1 font-mono text-xs text-muted-foreground">{p.id}</div>
              <div className="col-span-10 md:col-span-5 min-w-0">
                <div className="font-semibold truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.domain} · Diperbarui {p.updatedAt}</div>
              </div>
              <div className="col-span-6 md:col-span-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Langkah</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className={
                        "h-1.5 flex-1 " +
                        (s <= p.currentStep ? "bg-foreground" : "bg-border")
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="col-span-4 md:col-span-2">
                <span className={"inline-block px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest " + statusBadge(p.status)}>
                  {p.status}
                </span>
              </div>
              <div className="col-span-2 md:col-span-1 text-right text-xs font-mono opacity-40 group-hover:opacity-100">
                →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {openNew && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center px-4 z-50" onClick={() => setOpenNew(false)}>
          <div className="bg-background max-w-lg w-full border border-foreground" onClick={(e) => e.stopPropagation()}>
            <div className="hairline-b px-6 py-4 flex items-center justify-between">
              <div className="text-[10px] font-mono uppercase tracking-widest">Project Baru</div>
              <button onClick={() => setOpenNew(false)} className="font-mono text-sm">✕</button>
            </div>
            <div className="px-6 py-6 space-y-5">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Nama Project</label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="mis. Checkout — Diskon Voucher"
                  className="w-full border border-foreground px-3 py-2.5 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Domain</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full border border-foreground px-3 py-2.5 text-sm bg-background"
                >
                  <option>Autentikasi</option>
                  <option>Pembayaran</option>
                  <option>Onboarding</option>
                  <option>Checkout</option>
                  <option>Profil Pengguna</option>
                  <option>Notifikasi</option>
                </select>
              </div>
            </div>
            <div className="hairline-t px-6 py-4 flex justify-end gap-2">
              <button onClick={() => setOpenNew(false)} className="px-4 py-2 text-sm border border-foreground">Batal</button>
              <button onClick={handleCreate} className="px-4 py-2 text-sm bg-foreground text-background font-semibold">Buat & Buka</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
