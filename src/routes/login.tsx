import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";

import { useAuth } from "@/lib/auth";
import { LoginError } from "@/lib/auth-api";
import { DEMO_CREDENTIAL, isDemoMode } from "@/lib/auth-config";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const schema = z.object({
  email: z.string().min(1, "Email wajib diisi.").email("Format email tidak valid."),
  password: z.string().min(1, "Kata sandi wajib diisi."),
});

function LoginPage() {
  const { login, isAuthenticated, hydrated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sudah login → langsung ke dashboard.
  useEffect(() => {
    if (hydrated && isAuthenticated) {
      navigate({ to: "/", replace: true });
    }
  }, [hydrated, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldError({});

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const errs: { email?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as "email" | "password";
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldError(errs);
      return;
    }

    setSubmitting(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      navigate({ to: "/", replace: true });
    } catch (err) {
      setFormError(err instanceof LoginError ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-background text-foreground">
      {/* Panel kiri — branding */}
      <div className="hidden md:flex flex-col justify-between hairline-r px-10 py-10">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Alat QA
          </div>
          <div className="mt-2 text-2xl font-bold leading-tight">
            AI Test
            <br />
            Scenario
            <br />
            Generator
          </div>
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          Ubah dokumen requirement menjadi test scenario terstruktur. Masuk untuk melanjutkan
          pekerjaan tim QA Anda.
        </p>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          v0.9.3 — Prototipe
        </div>
      </div>

      {/* Panel kanan — form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Masuk / Autentikasi
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Selamat datang kembali.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Gunakan email dan kata sandi akun QA Anda.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                className="w-full border border-foreground px-3 py-2.5 text-sm focus:outline-none bg-background"
                aria-invalid={Boolean(fieldError.email)}
              />
              {fieldError.email && (
                <p className="mt-1.5 text-xs text-destructive">{fieldError.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2"
              >
                Kata sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full border border-foreground px-3 py-2.5 pr-16 text-sm focus:outline-none bg-background"
                  aria-invalid={Boolean(fieldError.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground px-1"
                  tabIndex={-1}
                >
                  {showPassword ? "Sembunyi" : "Lihat"}
                </button>
              </div>
              {fieldError.password && (
                <p className="mt-1.5 text-xs text-destructive">{fieldError.password}</p>
              )}
            </div>

            {formError && (
              <div className="border border-destructive/50 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-foreground text-background px-6 py-3 text-sm font-semibold hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Memproses…" : "Masuk"}
            </button>
          </form>

          <p className="mt-6 text-[11px] text-muted-foreground leading-relaxed">
            Kata sandi dienkripsi (RSA) di perangkat Anda sebelum dikirim.
          </p>

          {isDemoMode() && (
            <div className="mt-6 hairline-t pt-4 text-[11px] text-muted-foreground">
              <div className="font-mono uppercase tracking-widest text-[10px] mb-1">Mode Demo</div>
              Backend belum terhubung. Masuk dengan{" "}
              <span className="font-mono text-foreground">{DEMO_CREDENTIAL.email}</span> /{" "}
              <span className="font-mono text-foreground">{DEMO_CREDENTIAL.password}</span>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
