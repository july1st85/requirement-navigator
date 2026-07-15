import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Test Scenario Generator" },
      { name: "description", content: "Pengaturan akun, keamanan data, dan kuota." },
    ],
  }),
  component: SettingsPage,
});

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={
        "w-12 h-6 border border-foreground relative shrink-0 " +
        (on ? "bg-foreground" : "bg-background")
      }
      aria-pressed={on}
    >
      <span
        className={
          "absolute top-0.5 w-4 h-4 transition-all " +
          (on ? "left-[26px] bg-background" : "left-0.5 bg-foreground")
        }
      />
    </button>
  );
}

function SettingsPage() {
  const [deleteAfter, setDeleteAfter] = useState(true);
  const [allowTraining, setAllowTraining] = useState(false);
  const [ssoOnly, setSsoOnly] = useState(false);
  const [budget, setBudget] = useState(500);
  const [quota, setQuota] = useState(120);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="05 / Settings"
        title="Pengaturan."
        description="Kelola profil, keamanan data, dan batas biaya organisasi."
      />

      {/* Profil */}
      <section className="grid grid-cols-1 md:grid-cols-[240px_1fr] hairline-b">
        <div className="px-6 md:px-10 py-8 md:hairline-r">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Bagian 01</div>
          <h2 className="text-xl font-bold mt-2">Profil</h2>
        </div>
        <div className="px-6 md:px-10 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Nama</label>
            <input defaultValue="Reza Pratama" className="w-full border border-foreground px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Email Kantor</label>
            <input defaultValue="reza.pratama@qa-team.id" className="w-full border border-foreground px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Peran</label>
            <select className="w-full border border-foreground px-3 py-2 text-sm bg-background">
              <option>QA Engineer</option>
              <option>QA Lead</option>
              <option>Test Manager</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Tim</label>
            <input defaultValue="QA Core — Autentikasi" className="w-full border border-foreground px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      {/* Keamanan Data */}
      <section className="grid grid-cols-1 md:grid-cols-[240px_1fr] hairline-b">
        <div className="px-6 md:px-10 py-8 md:hairline-r">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Bagian 02</div>
          <h2 className="text-xl font-bold mt-2">Keamanan Data</h2>
          <p className="text-xs text-muted-foreground mt-3">
            Kontrol atas dokumen requirement dan penggunaan datanya.
          </p>
        </div>
        <div className="px-6 md:px-10 py-4">
          {[
            {
              label: "Hapus dokumen setelah diproses",
              desc: "Dokumen sumber dihapus dari server dalam 60 detik setelah ekstraksi selesai.",
              on: deleteAfter,
              set: setDeleteAfter,
            },
            {
              label: "Izinkan data untuk melatih model",
              desc: "Konten anonim boleh digunakan untuk meningkatkan kualitas generator.",
              on: allowTraining,
              set: setAllowTraining,
            },
            {
              label: "Hanya login via SSO organisasi",
              desc: "Nonaktifkan email/password untuk anggota tim.",
              on: ssoOnly,
              set: setSsoOnly,
            },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className={
                "grid grid-cols-[1fr_auto] items-start gap-6 py-5 " +
                (i < arr.length - 1 ? "hairline-b" : "")
              }
            >
              <div className="min-w-0">
                <div className="font-semibold">{row.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{row.desc}</div>
              </div>
              <Toggle on={row.on} onChange={row.set} />
            </div>
          ))}
        </div>
      </section>

      {/* Kuota */}
      <section className="grid grid-cols-1 md:grid-cols-[240px_1fr] hairline-b">
        <div className="px-6 md:px-10 py-8 md:hairline-r">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Bagian 03</div>
          <h2 className="text-xl font-bold mt-2">Biaya & Kuota</h2>
        </div>
        <div className="px-6 md:px-10 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Batas biaya bulanan (USD)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full border border-foreground px-3 py-2 text-sm tabular-nums"
            />
            <div className="mt-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Terpakai bulan ini: $187.40 / ${budget}
            </div>
            <div className="mt-2 h-1.5 bg-border">
              <div
                className="h-full bg-foreground"
                style={{ width: `${Math.min(100, (187.4 / budget) * 100)}%` }}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Kuota generate / anggota / bulan
            </label>
            <input
              type="number"
              value={quota}
              onChange={(e) => setQuota(Number(e.target.value))}
              className="w-full border border-foreground px-3 py-2 text-sm tabular-nums"
            />
            <div className="mt-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Rata-rata pemakaian tim: 74 generate / anggota
            </div>
          </div>
        </div>
      </section>

      <div className="px-6 md:px-10 py-6 flex items-center gap-4">
        <button
          onClick={save}
          className="bg-foreground text-background px-6 py-3 text-sm font-semibold"
        >
          Simpan Perubahan
        </button>
        {saved && (
          <span className="text-[10px] font-mono uppercase tracking-widest">
            ✓ Tersimpan
          </span>
        )}
      </div>
    </AppShell>
  );
}
