import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore, type Scenario, type ScenarioType, type StepId, type CoverageState } from "@/lib/store";

export const Route = createFileRoute("/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Ruang Kerja Project — AI Test Scenario Generator" },
      { name: "description", content: "Alur pembuatan test scenario per project." },
    ],
  }),
  component: ProjectWorkspace,
});

const STEPS: { id: StepId; label: string; sub: string }[] = [
  { id: 1, label: "Requirement", sub: "Unggah & ekstraksi" },
  { id: 2, label: "Quality Check", sub: "Ambiguitas & asumsi" },
  { id: 3, label: "Test Scenarios", sub: "Hasil generate" },
  { id: 4, label: "Coverage", sub: "Peta cakupan" },
  { id: 5, label: "Export", sub: "Format keluaran" },
];

function ProjectWorkspace() {
  const { projectId } = Route.useParams();
  const { getProject, updateProject } = useStore();
  const project = getProject(projectId);
  const navigate = useNavigate();
  const [active, setActive] = useState<StepId>(project?.currentStep ?? 1);

  if (!project) {
    return (
      <AppShell>
        <div className="px-6 md:px-10 py-16">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Tidak ditemukan</div>
          <h1 className="text-4xl font-bold mt-2">Project ini tidak ada.</h1>
          <Link to="/projects" className="inline-block mt-6 bg-foreground text-background px-5 py-2.5 text-sm font-semibold">
            ← Kembali ke Projects
          </Link>
        </div>
      </AppShell>
    );
  }

  const qcConfirmed = project.qcConfirmed;
  const stepLocked = (id: StepId) => id >= 3 && !qcConfirmed;

  const goto = (id: StepId) => {
    if (stepLocked(id)) return;
    setActive(id);
    updateProject(project.id, (p) => ({ currentStep: Math.max(p.currentStep, id) as StepId }));
  };

  return (
    <AppShell>
      {/* Project header */}
      <div className="hairline-b px-6 md:px-10 py-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
            <Link to="/projects" className="hover:underline">Projects</Link>
            <span className="mx-2">/</span>
            <span>{project.id}</span>
          </div>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight truncate">{project.name}</h1>
          <div className="mt-2 text-xs text-muted-foreground">
            Domain {project.domain} · Diperbarui {project.updatedAt} ·{" "}
            <span
              className={
                "font-mono uppercase tracking-widest " +
                (project.status === "Selesai" ? "" : project.status === "Direview" ? "text-accent" : "text-muted-foreground")
              }
            >
              {project.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => navigate({ to: "/projects" })}
            className="border border-foreground px-4 py-2 text-xs font-semibold uppercase tracking-widest"
          >
            ← Semua Project
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="hairline-b overflow-x-auto">
        <div className="grid grid-cols-5 min-w-[720px]">
          {STEPS.map((s) => {
            const locked = stepLocked(s.id);
            const isActive = active === s.id;
            const done = s.id < project.currentStep || (s.id === 2 && qcConfirmed);
            return (
              <button
                key={s.id}
                onClick={() => goto(s.id)}
                disabled={locked}
                className={
                  "text-left px-4 md:px-6 py-5 hairline-r last:border-r-0 relative " +
                  (isActive
                    ? "bg-foreground text-background"
                    : locked
                    ? "bg-secondary text-muted-foreground cursor-not-allowed"
                    : "hover:bg-secondary")
                }
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">
                    Langkah {String(s.id).padStart(2, "0")}
                  </span>
                  {locked && (
                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest">
                      <LockIcon /> Terkunci
                    </span>
                  )}
                  {done && !isActive && !locked && (
                    <span className="ml-auto text-[10px] font-mono uppercase tracking-widest">✓</span>
                  )}
                </div>
                <div className="mt-2 text-sm md:text-base font-bold leading-tight">{s.label}</div>
                <div
                  className={
                    "mt-1 text-[11px] " + (isActive ? "text-background/70" : "text-muted-foreground")
                  }
                >
                  {s.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 md:px-10 py-8">
        {active === 1 && <Step1Requirement project={project} onNext={() => goto(2)} />}
        {active === 2 && <Step2QC project={project} onConfirm={() => {
          updateProject(project.id, { qcConfirmed: true, currentStep: 3, status: project.status === "Draft" ? "Direview" : project.status });
          setActive(3);
        }} />}
        {active === 3 && <Step3Scenarios project={project} onNext={() => goto(4)} />}
        {active === 4 && <Step4Coverage project={project} onNext={() => goto(5)} />}
        {active === 5 && <Step5Export project={project} />}
      </div>
    </AppShell>
  );
}

function LockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="11" width="16" height="10" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

// ---------- STEP 1 ----------
function Step1Requirement({ project, onNext }: { project: ReturnType<typeof useStore>["projects"][number]; onNext: () => void }) {
  const [uploaded, setUploaded] = useState(project.requirements.length > 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-6">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">01 / Sumber</div>
          <h2 className="text-2xl font-bold mt-2">Unggah dokumen requirement</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Dokumen akan diekstraksi otomatis dan dipecah menjadi unit requirement yang terhitung.
          </p>
        </div>

        <div className="border-2 border-dashed border-foreground p-6 text-center">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
            Drag & drop / klik
          </div>
          <div className="text-sm mb-4">Format: PDF, DOCX, MD, TXT — maks 20MB</div>
          <button
            onClick={() => setUploaded(true)}
            className="bg-foreground text-background px-5 py-2 text-xs font-semibold uppercase tracking-widest"
          >
            {uploaded ? "Ganti Dokumen" : "Pilih Dokumen"}
          </button>
          {uploaded && (
            <div className="mt-4 pt-4 hairline-t text-left">
              <div className="font-mono text-xs">requirement-{project.id.toLowerCase()}.pdf</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                4 halaman · 12.4 KB · Terunggah 2 menit lalu
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Pratinjau Teks Terekstraksi
          </div>
          <div className="border border-foreground p-4 text-sm leading-relaxed max-h-56 overflow-auto">
            {project.rawText || "Tidak ada teks. Unggah dokumen terlebih dahulu."}
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">02 / Ekstraksi</div>
            <h2 className="text-2xl font-bold mt-2">Unit requirement</h2>
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            {String(project.requirements.length).padStart(2, "0")} unit
          </div>
        </div>

        <div className="hairline-t">
          {project.requirements.map((r) => (
            <div key={r.id} className="grid grid-cols-[80px_1fr_auto] items-start gap-4 py-4 hairline-b">
              <div className="font-mono text-xs font-semibold">{r.id}</div>
              <div className="text-sm leading-relaxed">{r.text}</div>
              <button className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:underline">
                Edit
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onNext}
            className="bg-foreground text-background px-6 py-3 text-sm font-semibold"
          >
            Lanjut ke Quality Check →
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- STEP 2 ----------
function Step2QC({ project, onConfirm }: { project: ReturnType<typeof useStore>["projects"][number]; onConfirm: () => void }) {
  const { updateProject } = useStore();
  const allResolved =
    project.ambiguities.every((a) => a.resolved !== "pending") &&
    project.assumptions.every((a) => a.resolved !== "pending");

  const resolve = (kind: "amb" | "asm", id: string, val: "accepted" | "fixed") => {
    updateProject(project.id, (p) => ({
      ambiguities: kind === "amb" ? p.ambiguities.map((x) => (x.id === id ? { ...x, resolved: val } : x)) : p.ambiguities,
      assumptions: kind === "asm" ? p.assumptions.map((x) => (x.id === id ? { ...x, resolved: val } : x)) : p.assumptions,
    }));
  };

  return (
    <div className="space-y-8">
      <div className="border border-foreground bg-secondary px-5 py-4 flex items-start gap-4">
        <div className="font-mono text-[10px] uppercase tracking-widest bg-foreground text-background px-2 py-1 shrink-0">
          Gerbang Wajib
        </div>
        <div className="text-sm">
          Langkah <span className="font-semibold">Test Scenarios</span> tidak dapat diakses sebelum
          Quality Check dikonfirmasi minimal satu kali. Tinjau setiap item di bawah.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <QCList
          title="Ambiguitas Terdeteksi"
          eyebrow="03 / Ambiguitas"
          items={project.ambiguities}
          onResolve={(id, val) => resolve("amb", id, val)}
        />
        <QCList
          title="Asumsi AI yang Akan Dipakai"
          eyebrow="04 / Asumsi"
          items={project.assumptions}
          onResolve={(id, val) => resolve("asm", id, val)}
        />
      </div>

      <div className="hairline-t pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-xs text-muted-foreground">
          {allResolved
            ? "✓ Semua item telah ditinjau. Anda dapat melanjutkan."
            : "Tinjau seluruh item untuk hasil terbaik. Anda tetap dapat melanjutkan."}
        </div>
        <button
          onClick={onConfirm}
          className="bg-foreground text-background px-6 py-3 text-sm font-semibold"
        >
          Konfirmasi & Lanjutkan →
        </button>
      </div>
    </div>
  );
}

function QCList({
  title,
  eyebrow,
  items,
  onResolve,
}: {
  title: string;
  eyebrow: string;
  items: { id: string; text: string; resolved: "pending" | "accepted" | "fixed" }[];
  onResolve: (id: string, val: "accepted" | "fixed") => void;
}) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{eyebrow}</div>
      <h3 className="text-xl font-bold mt-1 mb-4">{title}</h3>
      {items.length === 0 && (
        <div className="border border-dashed border-foreground/40 p-5 text-sm text-muted-foreground">
          Tidak ada item pada bagian ini.
        </div>
      )}
      <div className="hairline-t">
        {items.map((it) => (
          <div key={it.id} className="py-4 hairline-b">
            <div className="flex items-baseline gap-3">
              <div className="font-mono text-xs font-semibold">{it.id}</div>
              <div
                className={
                  "text-[10px] font-mono uppercase tracking-widest " +
                  (it.resolved === "pending"
                    ? "text-accent"
                    : it.resolved === "accepted"
                    ? "text-muted-foreground"
                    : "text-foreground")
                }
              >
                {it.resolved === "pending" ? "● Perlu tinjau" : it.resolved === "accepted" ? "✓ Diterima" : "✎ Diperbaiki"}
              </div>
            </div>
            <div className="text-sm mt-2 leading-relaxed">{it.text}</div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onResolve(it.id, "accepted")}
                className={
                  "px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest border border-foreground " +
                  (it.resolved === "accepted" ? "bg-foreground text-background" : "")
                }
              >
                Terima
              </button>
              <button
                onClick={() => onResolve(it.id, "fixed")}
                className={
                  "px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest border border-foreground " +
                  (it.resolved === "fixed" ? "bg-foreground text-background" : "")
                }
              >
                Perbaiki
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- STEP 3 ----------
const TYPES: ScenarioType[] = ["Positive", "Negative", "Boundary", "Security", "Performance", "Regression"];

function Step3Scenarios({ project, onNext }: { project: ReturnType<typeof useStore>["projects"][number]; onNext: () => void }) {
  const { updateProject } = useStore();
  const [tab, setTab] = useState<ScenarioType>("Positive");
  const grouped = useMemo(() => {
    const map: Record<ScenarioType, Scenario[]> = {
      Positive: [], Negative: [], Boundary: [], Security: [], Performance: [], Regression: [],
    };
    project.scenarios.forEach((s) => map[s.type].push(s));
    return map;
  }, [project.scenarios]);

  const setScenarios = (fn: (prev: Scenario[]) => Scenario[]) =>
    updateProject(project.id, (p) => ({ scenarios: fn(p.scenarios) }));

  if (project.scenarios.length === 0) {
    return (
      <div className="border border-foreground p-10 text-center">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Belum di-generate</div>
        <h2 className="text-2xl font-bold mt-2">Generate test scenario sekarang</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Berdasarkan {project.requirements.length} requirement dan asumsi yang telah dikonfirmasi.
        </p>
        <button
          onClick={() =>
            updateProject(project.id, () => ({
              scenarios: [
                { id: "TC-001", type: "Positive", title: "Alur utama berhasil", steps: ["Langkah 1", "Langkah 2", "Verifikasi hasil"], source: "REQ-01", approved: false },
              ],
            }))
          }
          className="mt-5 bg-foreground text-background px-6 py-3 text-sm font-semibold"
        >
          Generate 12 Skenario →
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">05 / Hasil</div>
          <h2 className="text-2xl font-bold mt-1">Test scenarios ter-generate</h2>
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          {String(project.scenarios.length).padStart(2, "0")} total ·{" "}
          {String(project.scenarios.filter((s) => s.approved).length).padStart(2, "0")} disetujui
        </div>
      </div>

      <div className="hairline-b overflow-x-auto">
        <div className="flex min-w-max">
          {TYPES.map((t) => {
            const count = grouped[t].length;
            const isActive = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={
                  "px-5 py-3 text-xs font-semibold uppercase tracking-widest hairline-r " +
                  (isActive ? "bg-foreground text-background" : count === 0 ? "text-muted-foreground" : "")
                }
              >
                {t}
                <span className={"ml-2 font-mono " + (isActive ? "opacity-70" : "text-muted-foreground")}>
                  {String(count).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {grouped[tab].length === 0 && (
          <div className="text-sm text-muted-foreground py-8 text-center">
            Tidak ada skenario tipe {tab} untuk project ini.
          </div>
        )}
        {grouped[tab].map((s) => (
          <article key={s.id} className="border border-foreground">
            <header className="hairline-b px-5 py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <div className="font-mono text-xs font-semibold">{s.id}</div>
              <div className="font-semibold min-w-0 flex-1">{s.title}</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Sumber: {s.source}
                {s.assumption && (
                  <span className="ml-3 text-accent">· Asumsi: {s.assumption}</span>
                )}
              </div>
            </header>
            <div className="px-5 py-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Langkah</div>
              <ol className="space-y-1.5 text-sm">
                {s.steps.map((st, i) => (
                  <li key={i} className="grid grid-cols-[24px_1fr] gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ol>
            </div>
            <footer className="hairline-t px-5 py-2.5 flex flex-wrap gap-x-4 gap-y-1 items-center">
              <button
                onClick={() =>
                  setScenarios((prev) => prev.map((x) => (x.id === s.id ? { ...x, approved: !x.approved } : x)))
                }
                className={
                  "text-[10px] font-mono uppercase tracking-widest " +
                  (s.approved ? "text-foreground font-semibold" : "hover:underline")
                }
              >
                {s.approved ? "✓ Disetujui" : "Setujui"}
              </button>
              <button className="text-[10px] font-mono uppercase tracking-widest hover:underline">Edit</button>
              <button className="text-[10px] font-mono uppercase tracking-widest hover:underline">
                Regenerate
              </button>
              <button
                onClick={() => setScenarios((prev) => prev.filter((x) => x.id !== s.id))}
                className="text-[10px] font-mono uppercase tracking-widest text-accent hover:underline ml-auto"
              >
                Hapus
              </button>
            </footer>
          </article>
        ))}
      </div>

      <div className="hairline-t mt-8 pt-6 flex justify-end">
        <button onClick={onNext} className="bg-foreground text-background px-6 py-3 text-sm font-semibold">
          Lanjut ke Coverage →
        </button>
      </div>
    </div>
  );
}

// ---------- STEP 4 ----------
function Step4Coverage({ project, onNext }: { project: ReturnType<typeof useStore>["projects"][number]; onNext: () => void }) {
  const cov = project.coverage.length > 0
    ? project.coverage
    : project.requirements.map((r) => ({ reqId: r.id, state: "risky" as CoverageState, note: "Belum dianalisis" }));

  const total = cov.length || 1;
  const covered = cov.filter((c) => c.state === "covered").length;
  const risky = cov.filter((c) => c.state === "risky").length;
  const uncov = cov.filter((c) => c.state === "uncoverable").length;
  const pct = Math.round((covered / total) * 100);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 hairline-b hairline-t">
        <div className="px-6 py-6 md:hairline-r">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Persentase Cakupan</div>
          <div className="mt-2 text-5xl font-bold tabular-nums">{pct}%</div>
        </div>
        <div className="px-6 py-6 md:hairline-r">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Ter-cover</div>
          <div className="mt-2 text-3xl font-bold tabular-nums">{String(covered).padStart(2, "0")}</div>
        </div>
        <div className="px-6 py-6 md:hairline-r">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Berisiko</div>
          <div className="mt-2 text-3xl font-bold tabular-nums text-accent">{String(risky).padStart(2, "0")}</div>
        </div>
        <div className="px-6 py-6">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Tidak bisa di-cover</div>
          <div className="mt-2 text-3xl font-bold tabular-nums text-muted-foreground">{String(uncov).padStart(2, "0")}</div>
        </div>
      </div>

      <div className="mt-8 mb-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        06 / Peta cakupan per requirement
      </div>

      <div className="hairline-t">
        {cov.map((c) => {
          const req = project.requirements.find((r) => r.id === c.reqId);
          return (
            <div key={c.reqId} className="grid grid-cols-[100px_1fr_140px] gap-4 items-start py-4 hairline-b">
              <div className="font-mono text-xs font-semibold">{c.reqId}</div>
              <div>
                <div className="text-sm">{req?.text ?? "—"}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                  {c.note}
                </div>
              </div>
              <div className="text-right">
                <span
                  className={
                    "inline-block px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest " +
                    (c.state === "covered"
                      ? "bg-foreground text-background"
                      : c.state === "risky"
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground")
                  }
                >
                  {c.state === "covered" ? "Ter-cover" : c.state === "risky" ? "Berisiko" : "Tidak bisa"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={onNext} className="bg-foreground text-background px-6 py-3 text-sm font-semibold">
          Lanjut ke Export →
        </button>
      </div>
    </div>
  );
}

// ---------- STEP 5 ----------
function Step5Export({ project }: { project: ReturnType<typeof useStore>["projects"][number] }) {
  const { updateProject } = useStore();
  const [toast, setToast] = useState<string | null>(null);
  const trigger = (label: string) => {
    setToast(label);
    updateProject(project.id, () => ({ status: "Selesai", currentStep: 5 }));
    setTimeout(() => setToast(null), 2500);
  };

  const first = project.scenarios[0];
  const gherkin = first
    ? `Feature: ${project.name}\n\n  Scenario: ${first.title}\n${first.steps
        .map((s, i) => `    ${i === 0 ? "Given" : i === first.steps.length - 1 ? "Then" : "When"} ${s.toLowerCase()}`)
        .join("\n")}`
    : `Feature: ${project.name}\n\n  # Belum ada skenario`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">07 / Format</div>
        <h2 className="text-2xl font-bold mt-1 mb-6">Pilih format ekspor</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 hairline-t hairline-b">
          {[
            { id: "xlsx", name: "Tabel / Excel", desc: ".xlsx untuk manajemen test manual" },
            { id: "gherkin", name: "Gherkin / JSON", desc: "Otomasi Cucumber & Playwright" },
            { id: "jira", name: "Kirim ke Jira", desc: "Buat issue di project terhubung" },
          ].map((opt, i) => (
            <button
              key={opt.id}
              onClick={() => trigger(`Ekspor ${opt.name} dimulai`)}
              className={"text-left px-5 py-6 hover:bg-secondary " + (i < 2 ? "md:hairline-r" : "")}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Opsi 0{i + 1}
              </div>
              <div className="mt-2 font-bold text-lg">{opt.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{opt.desc}</div>
              <div className="mt-4 inline-block bg-foreground text-background px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest">
                Ekspor →
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">08 / Pratinjau</div>
        <h3 className="text-xl font-bold mt-1 mb-4">Format Gherkin</h3>
        <pre className="border border-foreground bg-secondary p-4 text-[12px] leading-relaxed font-mono overflow-auto">
{gherkin}
        </pre>
        <div className="mt-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Pratinjau menggunakan skenario pertama dalam project.
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-foreground text-background px-5 py-3 text-sm font-semibold shadow z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
