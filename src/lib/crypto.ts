/**
 * Enkripsi password sisi klien memakai RSA-OAEP (Web Crypto API bawaan browser).
 *
 * Password dienkripsi dengan PUBLIC KEY server sebelum dikirim, sehingga plaintext
 * tidak pernah melintas di jaringan. Server mendekripsi dengan private key-nya.
 *
 * Catatan: ini LAPISAN TAMBAHAN, bukan pengganti HTTPS. Server tetap wajib TLS
 * dan tetap wajib meng-hash password saat menyimpannya.
 */

import { AUTH_CONFIG } from "./auth-config";

/** Ubah PEM (SPKI) menjadi ArrayBuffer DER. */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/** Ubah ArrayBuffer menjadi string base64. */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Import public key SPKI/PEM menjadi CryptoKey untuk enkripsi RSA-OAEP. */
export async function importPublicKey(pem: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "spki",
    pemToArrayBuffer(pem),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
}

/**
 * Enkripsi password dan kembalikan ciphertext base64.
 * @throws bila public key belum dikonfigurasi atau Web Crypto tidak tersedia.
 */
export async function encryptPassword(
  plain: string,
  pem: string = AUTH_CONFIG.publicKeyPem,
): Promise<string> {
  if (!pem) {
    throw new Error("Public key auth belum dikonfigurasi.");
  }
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Web Crypto tidak tersedia di lingkungan ini.");
  }
  const key = await importPublicKey(pem);
  const data = new TextEncoder().encode(plain);
  const cipher = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, data);
  return arrayBufferToBase64(cipher);
}
