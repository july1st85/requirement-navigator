/**
 * Klien API autentikasi.
 *
 * KONTRAK ASUMSI (backend belum ada) — sesuaikan di satu tempat ini saat siap:
 *   POST {apiBaseUrl}{loginPath}
 *   Request body : { email: string, password: string }  // `password` = ciphertext base64 (RSA-OAEP)
 *   Response 200 : { token: string, user?: { email: string, name?: string } }
 *   Response 4xx : { message?: string }
 *
 * Selama VITE_AUTH_API_BASE_URL kosong, dijalankan DEMO FALLBACK agar prototype
 * tetap bisa login. Hapus blok demo begitu backend nyata aktif.
 */

import { AUTH_CONFIG, DEMO_CREDENTIAL, isDemoMode } from "./auth-config";
import { encryptPassword } from "./crypto";

export interface AuthUser {
  email: string;
  name?: string;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

/** Error login dengan pesan ramah-pengguna (Bahasa Indonesia). */
export class LoginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoginError";
  }
}

const GENERIC_INVALID = "Email atau kata sandi salah.";

/**
 * Lakukan login: enkripsi password, lalu kirim ke API (atau demo fallback).
 * @throws {LoginError} bila kredensial salah atau server bermasalah.
 */
export async function loginRequest(email: string, password: string): Promise<LoginResult> {
  // Password SELALU dienkripsi lebih dulu — baik demo maupun backend nyata.
  let passwordEnc: string;
  try {
    passwordEnc = await encryptPassword(password);
  } catch {
    throw new LoginError("Gagal mengenkripsi kata sandi. Coba lagi.");
  }

  if (isDemoMode()) {
    return demoLogin(email, password);
  }

  let res: Response;
  try {
    res = await fetch(`${AUTH_CONFIG.apiBaseUrl}${AUTH_CONFIG.loginPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: passwordEnc }),
    });
  } catch {
    throw new LoginError("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
  }

  if (res.status === 401 || res.status === 400) {
    throw new LoginError(GENERIC_INVALID);
  }
  if (!res.ok) {
    throw new LoginError("Terjadi kesalahan pada server. Coba lagi nanti.");
  }

  const data = (await res.json().catch(() => null)) as { token?: string; user?: AuthUser } | null;
  if (!data?.token) {
    throw new LoginError("Respons server tidak valid.");
  }
  return { token: data.token, user: data.user ?? { email } };
}

/**
 * DEMO FALLBACK — hanya aktif saat backend belum dikonfigurasi.
 * Password sudah dienkripsi di atas (jalur enkripsi tetap teruji), di sini kita
 * hanya mencocokkan kredensial demo. Hapus fungsi ini saat backend nyata aktif.
 */
async function demoLogin(email: string, password: string): Promise<LoginResult> {
  // Simulasi latensi jaringan agar UX (loading) terasa realistis.
  await new Promise((r) => setTimeout(r, 400));
  const emailOk = email.trim().toLowerCase() === DEMO_CREDENTIAL.email;
  const passOk = password === DEMO_CREDENTIAL.password;
  if (!emailOk || !passOk) {
    throw new LoginError(GENERIC_INVALID);
  }
  return {
    token: `demo.${btoa(email)}.${Date.now().toString(36)}`,
    user: { email: DEMO_CREDENTIAL.email, name: "QA Engineer" },
  };
}
