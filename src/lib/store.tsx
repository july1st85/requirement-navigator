import { createContext, useContext, useState, type ReactNode } from "react";

export type ProjectStatus = "Draft" | "Direview" | "Selesai";
export type StepId = 1 | 2 | 3 | 4 | 5;

export interface Requirement {
  id: string;
  text: string;
}
export interface Ambiguity {
  id: string;
  text: string;
  resolved: "pending" | "accepted" | "fixed";
}
export interface Assumption {
  id: string;
  text: string;
  resolved: "pending" | "accepted" | "fixed";
}
export type ScenarioType = "Positive" | "Negative" | "Boundary" | "Security" | "Performance" | "Regression";
export interface Scenario {
  id: string;
  type: ScenarioType;
  title: string;
  steps: string[];
  source: string;
  assumption?: string;
  approved: boolean;
}
export type CoverageState = "covered" | "risky" | "uncoverable";
export interface CoverageItem {
  reqId: string;
  state: CoverageState;
  note: string;
}
export interface Project {
  id: string;
  name: string;
  domain: string;
  status: ProjectStatus;
  updatedAt: string;
  currentStep: StepId;
  qcConfirmed: boolean;
  archived: boolean;
  requirements: Requirement[];
  ambiguities: Ambiguity[];
  assumptions: Assumption[];
  scenarios: Scenario[];
  coverage: CoverageItem[];
  rawText: string;
}

const seedProjects = (): Project[] => [
  {
    id: "PRJ-001",
    name: "Login & Autentikasi v2.3",
    domain: "Autentikasi",
    status: "Direview",
    updatedAt: "2026-07-14",
    currentStep: 3,
    qcConfirmed: true,
    archived: false,
    rawText:
      "Modul login harus mendukung email/password, OTP via SMS, dan Single Sign-On. Kata sandi minimal 12 karakter dengan kombinasi huruf besar, angka, dan simbol. Batas percobaan gagal adalah 5 kali dalam 15 menit sebelum akun terkunci sementara.",
    requirements: [
      { id: "REQ-01", text: "Pengguna dapat masuk menggunakan email dan kata sandi." },
      { id: "REQ-02", text: "Kata sandi minimal 12 karakter dengan huruf besar, angka, dan simbol." },
      { id: "REQ-03", text: "Sistem mengunci akun selama 30 menit setelah 5 kali gagal masuk." },
      { id: "REQ-04", text: "OTP dikirim via SMS dan berlaku selama 120 detik." },
      { id: "REQ-05", text: "Sesi pengguna kedaluwarsa setelah 30 menit idle." },
      { id: "REQ-06", text: "SSO tersedia untuk Google Workspace dan Microsoft Entra." },
      { id: "REQ-07", text: "Log aktivitas login disimpan selama 90 hari." },
    ],
    ambiguities: [
      { id: "AMB-01", text: "Definisi 'idle' pada REQ-05 tidak jelas — apakah mencakup tab tidak aktif?", resolved: "pending" },
      { id: "AMB-02", text: "REQ-04 tidak menyebutkan jumlah maksimum permintaan OTP per jam.", resolved: "pending" },
      { id: "AMB-03", text: "REQ-06 tidak menspesifikasi perilaku bila akun SSO belum ada di sistem.", resolved: "accepted" },
    ],
    assumptions: [
      { id: "ASM-01", text: "Idle diukur dari interaksi mouse/keyboard, bukan tab visibility.", resolved: "accepted" },
      { id: "ASM-02", text: "Maksimum 3 permintaan OTP per 15 menit untuk mencegah abuse.", resolved: "accepted" },
      { id: "ASM-03", text: "SSO tanpa akun akan memicu alur registrasi otomatis.", resolved: "pending" },
    ],
    scenarios: [
      { id: "TC-001", type: "Positive", title: "Login berhasil dengan kredensial valid", steps: ["Buka halaman /login", "Isi email terdaftar", "Isi kata sandi valid (12+ karakter)", "Klik tombol Masuk", "Verifikasi redirect ke /dashboard"], source: "REQ-01", approved: true },
      { id: "TC-002", type: "Positive", title: "Login via SSO Google Workspace", steps: ["Klik tombol 'Masuk dengan Google'", "Pilih akun Workspace terdaftar", "Verifikasi redirect ke /dashboard"], source: "REQ-06", approved: false },
      { id: "TC-003", type: "Negative", title: "Login gagal karena kata sandi salah", steps: ["Isi email valid", "Isi kata sandi salah", "Klik Masuk", "Verifikasi pesan 'Email atau kata sandi salah'"], source: "REQ-01", approved: true },
      { id: "TC-004", type: "Negative", title: "Login diblokir setelah 5 kali gagal", steps: ["Ulangi login gagal 5 kali dalam 15 menit", "Verifikasi akun terkunci 30 menit", "Verifikasi email notifikasi terkirim"], source: "REQ-03", approved: false },
      { id: "TC-005", type: "Boundary", title: "Kata sandi tepat 12 karakter diterima", steps: ["Registrasi dengan kata sandi 'Aa1!Aa1!Aa1!'", "Verifikasi berhasil"], source: "REQ-02", approved: false },
      { id: "TC-006", type: "Boundary", title: "Kata sandi 11 karakter ditolak", steps: ["Registrasi dengan kata sandi 'Aa1!Aa1!Aa1'", "Verifikasi pesan validasi minimum 12 karakter"], source: "REQ-02", approved: true },
      { id: "TC-007", type: "Boundary", title: "OTP dimasukkan pada detik ke-119", steps: ["Minta OTP", "Tunggu 119 detik", "Kirim OTP", "Verifikasi diterima"], source: "REQ-04", assumption: "ASM-02", approved: false },
      { id: "TC-008", type: "Security", title: "Proteksi SQL injection pada field email", steps: ["Isi email dengan payload \"' OR 1=1 --\"", "Klik Masuk", "Verifikasi ditolak sebagai email tidak valid"], source: "REQ-01", approved: true },
      { id: "TC-009", type: "Security", title: "Rate limit permintaan OTP", steps: ["Minta OTP 4 kali berturut", "Verifikasi permintaan ke-4 ditolak dengan HTTP 429"], source: "REQ-04", assumption: "ASM-02", approved: false },
      { id: "TC-010", type: "Security", title: "Sesi kedaluwarsa memaksa login ulang", steps: ["Login berhasil", "Diamkan 31 menit", "Coba akses /dashboard", "Verifikasi redirect ke /login"], source: "REQ-05", assumption: "ASM-01", approved: false },
      { id: "TC-011", type: "Performance", title: "Response login < 800ms pada 95 percentile", steps: ["Jalankan 1000 request login paralel", "Ukur latency", "Verifikasi p95 < 800ms"], source: "REQ-01", approved: false },
      { id: "TC-012", type: "Regression", title: "Login lama masih kompatibel setelah upgrade SSO", steps: ["Login email/password akun yang dibuat sebelum v2.3", "Verifikasi berhasil tanpa migrasi paksa"], source: "REQ-01", approved: true },
    ],
    coverage: [
      { reqId: "REQ-01", state: "covered", note: "3 skenario positif & negatif" },
      { reqId: "REQ-02", state: "covered", note: "Boundary lengkap" },
      { reqId: "REQ-03", state: "risky", note: "Belum ada skenario untuk reset counter" },
      { reqId: "REQ-04", state: "covered", note: "Bergantung pada ASM-02" },
      { reqId: "REQ-05", state: "covered", note: "Bergantung pada ASM-01" },
      { reqId: "REQ-06", state: "risky", note: "SSO tanpa akun (ASM-03) belum dikonfirmasi" },
      { reqId: "REQ-07", state: "uncoverable", note: "Tidak ada endpoint audit terbuka di scope ini" },
    ],
  },
  {
    id: "PRJ-002",
    name: "Gateway Pembayaran — Kartu Kredit",
    domain: "Pembayaran",
    status: "Draft",
    updatedAt: "2026-07-13",
    currentStep: 1,
    qcConfirmed: false,
    archived: false,
    rawText:
      "Modul pembayaran menerima kartu Visa, Mastercard, JCB. Nominal transaksi 10.000 – 50.000.000 IDR. 3D Secure wajib untuk transaksi di atas 1.000.000 IDR.",
    requirements: [
      { id: "REQ-01", text: "Sistem menerima kartu Visa, Mastercard, dan JCB." },
      { id: "REQ-02", text: "Nominal transaksi antara 10.000 – 50.000.000 IDR." },
      { id: "REQ-03", text: "3D Secure wajib untuk transaksi di atas 1.000.000 IDR." },
      { id: "REQ-04", text: "Refund dapat dilakukan dalam 30 hari setelah settlement." },
      { id: "REQ-05", text: "Nomor kartu tidak boleh disimpan dalam bentuk plain text." },
      { id: "REQ-06", text: "Bukti transaksi dikirim via email dalam 60 detik." },
    ],
    ambiguities: [
      { id: "AMB-01", text: "REQ-03 tidak menyebutkan behavior bila 3DS challenge gagal.", resolved: "pending" },
      { id: "AMB-02", text: "Mata uang selain IDR tidak dijelaskan.", resolved: "pending" },
    ],
    assumptions: [
      { id: "ASM-01", text: "Kegagalan 3DS akan me-void transaksi dan menampilkan pesan generik.", resolved: "pending" },
      { id: "ASM-02", text: "Hanya IDR yang didukung pada rilis ini.", resolved: "pending" },
    ],
    scenarios: [],
    coverage: [],
  },
  {
    id: "PRJ-003",
    name: "Pendaftaran Pengguna & Verifikasi Umur",
    domain: "Onboarding",
    status: "Selesai",
    updatedAt: "2026-07-09",
    currentStep: 5,
    qcConfirmed: true,
    archived: false,
    rawText: "Pendaftaran wajib berumur minimal 18 tahun dan maksimal 65 tahun berdasarkan tanggal lahir KTP.",
    requirements: [
      { id: "REQ-01", text: "Umur pengguna minimal 18 tahun." },
      { id: "REQ-02", text: "Umur pengguna maksimal 65 tahun." },
      { id: "REQ-03", text: "Verifikasi tanggal lahir mengacu pada NIK KTP." },
      { id: "REQ-04", text: "Field NIK harus 16 digit angka." },
    ],
    ambiguities: [],
    assumptions: [
      { id: "ASM-01", text: "Batas umur dihitung pada tanggal pendaftaran, bukan akhir bulan.", resolved: "accepted" },
    ],
    scenarios: [
      { id: "TC-001", type: "Boundary", title: "Umur tepat 18 tahun diterima", steps: ["Daftar dengan tanggal lahir hari ini 18 tahun lalu", "Verifikasi berhasil"], source: "REQ-01", approved: true },
      { id: "TC-002", type: "Boundary", title: "Umur 17 tahun 11 bulan ditolak", steps: ["Daftar dengan tanggal lahir 17 tahun 11 bulan lalu", "Verifikasi ditolak dengan pesan batas umur"], source: "REQ-01", approved: true },
      { id: "TC-003", type: "Boundary", title: "Umur tepat 65 tahun diterima", steps: ["Daftar dengan tanggal lahir hari ini 65 tahun lalu", "Verifikasi berhasil"], source: "REQ-02", approved: true },
      { id: "TC-004", type: "Negative", title: "NIK 15 digit ditolak", steps: ["Isi NIK 15 digit", "Verifikasi validasi 'NIK harus 16 digit'"], source: "REQ-04", approved: true },
    ],
    coverage: [
      { reqId: "REQ-01", state: "covered", note: "Boundary bawah lengkap" },
      { reqId: "REQ-02", state: "covered", note: "Boundary atas lengkap" },
      { reqId: "REQ-03", state: "risky", note: "Konsistensi dengan NIK belum diuji" },
      { reqId: "REQ-04", state: "covered", note: "Validasi panjang teruji" },
    ],
  },
  {
    id: "PRJ-004",
    name: "Reset Password via Email",
    domain: "Autentikasi",
    status: "Draft",
    updatedAt: "2026-07-11",
    currentStep: 2,
    qcConfirmed: false,
    archived: false,
    rawText: "Pengguna dapat meminta reset password melalui email. Tautan berlaku 15 menit dan hanya dapat digunakan sekali.",
    requirements: [
      { id: "REQ-01", text: "Pengguna dapat meminta reset password via email terdaftar." },
      { id: "REQ-02", text: "Tautan reset berlaku 15 menit sejak dikirim." },
      { id: "REQ-03", text: "Tautan hanya dapat digunakan satu kali." },
    ],
    ambiguities: [
      { id: "AMB-01", text: "Perilaku bila email tidak terdaftar tidak dijelaskan (bocorkan info atau tidak).", resolved: "pending" },
    ],
    assumptions: [
      { id: "ASM-01", text: "Sistem menampilkan pesan sukses generik untuk email yang tidak terdaftar (anti enumeration).", resolved: "pending" },
    ],
    scenarios: [],
    coverage: [],
  },
];

interface StoreCtx {
  projects: Project[];
  getProject: (id: string) => Project | undefined;
  updateProject: (id: string, patch: Partial<Project> | ((p: Project) => Partial<Project>)) => void;
  createProject: (name: string, domain: string) => string;
  archiveProject: (id: string) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(seedProjects);

  const value: StoreCtx = {
    projects,
    getProject: (id) => projects.find((p) => p.id === id),
    updateProject: (id, patch) =>
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const delta = typeof patch === "function" ? patch(p) : patch;
          return { ...p, ...delta };
        }),
      ),
    createProject: (name, domain) => {
      const id = `PRJ-${String(projects.length + 1).padStart(3, "0")}`;
      const newP: Project = {
        id,
        name,
        domain,
        status: "Draft",
        updatedAt: new Date().toISOString().slice(0, 10),
        currentStep: 1,
        qcConfirmed: false,
        archived: false,
        rawText: "",
        requirements: [
          { id: "REQ-01", text: "Requirement contoh — silakan unggah dokumen untuk ekstraksi otomatis." },
        ],
        ambiguities: [],
        assumptions: [],
        scenarios: [],
        coverage: [],
      };
      setProjects((prev) => [newP, ...prev]);
      return id;
    },
    archiveProject: (id) =>
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, archived: !p.archived } : p))),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
}
