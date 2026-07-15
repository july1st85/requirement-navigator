/**
 * Konfigurasi autentikasi terpusat.
 *
 * Nilai diambil dari env `VITE_*` (diinjeksi oleh @lovable.dev/vite-tanstack-config)
 * dengan fallback yang aman untuk mode prototype. Saat backend nyata sudah siap,
 * cukup isi env berikut tanpa mengubah kode lain:
 *
 *   VITE_AUTH_API_BASE_URL  → base URL API, mis. "https://api.example.com"
 *   VITE_AUTH_PUBLIC_KEY    → public key server (format PEM/SPKI) untuk enkripsi password
 *
 * Selama VITE_AUTH_API_BASE_URL kosong, login berjalan dalam DEMO MODE
 * (lihat auth-api.ts) supaya prototype tetap bisa dipakai.
 */

const env = import.meta.env as Record<string, string | undefined>;

/**
 * Public key DEMO (2048-bit RSA, format SPKI/PEM).
 * Hanya untuk prototype: private key pasangannya TIDAK ada di aplikasi.
 * Ganti lewat VITE_AUTH_PUBLIC_KEY saat backend menyediakan key aslinya.
 */
const DEMO_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxXRs3/91Pkv7NaVwwdQ5
Kk2GT9Zy9+2rGF5yxxf4zOl62Cy3gfm+TOvFPthr2YidkLaGgpceJwTIKYw9BgvR
CrDw+cnwZpx8R4DrukOYkIEAD7w30FFcyVwcB9gEeA7CnF70f7QjqNERqrVYlWqP
oHX2n2tQvYCo3xdEY3lvHQLnDVdMXY9U5V9o+s9l+jOHDdnPJ6ui/4xQYPW43Jf8
LJuykRlsE85xMPk63zwrcoifx0ZO3orQ3UT9feuVX8nNq9AyBJxlJxbWs/rIiNxr
hXl92UxzSPcL2c9IEF5ZEBNa7aVp3DxSIMBTnkbOLR+ypGZ8xrt4QA5zZLocDbbI
DQIDAQAB
-----END PUBLIC KEY-----`;

export const AUTH_CONFIG = {
  /** Base URL API. Kosong => DEMO MODE. */
  apiBaseUrl: (env.VITE_AUTH_API_BASE_URL ?? "").replace(/\/$/, ""),
  /** Path endpoint login (digabung dengan apiBaseUrl). */
  loginPath: env.VITE_AUTH_LOGIN_PATH ?? "/auth/login",
  /** Public key server untuk enkripsi password (PEM/SPKI). */
  publicKeyPem: env.VITE_AUTH_PUBLIC_KEY ?? DEMO_PUBLIC_KEY_PEM,
  /** Kunci penyimpanan token di localStorage. */
  tokenStorageKey: "tsg.auth.token",
  /** Kunci penyimpanan data user di localStorage. */
  userStorageKey: "tsg.auth.user",
} as const;

/** True bila backend nyata belum dikonfigurasi (jalankan demo fallback). */
export const isDemoMode = () => AUTH_CONFIG.apiBaseUrl === "";

/**
 * Kredensial DEMO — hanya berlaku saat isDemoMode() true.
 * Hapus bagian ini begitu backend nyata aktif.
 */
export const DEMO_CREDENTIAL = {
  email: "qa@requirement.test",
  password: "password123",
} as const;
