import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider } from "../lib/store";
import { AuthProvider } from "../lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
          Error 404
        </div>
        <h1 className="mt-3 text-5xl font-bold tracking-tight">Halaman tidak ditemukan.</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Alamat yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-block bg-foreground text-background px-5 py-2.5 text-sm font-semibold"
          >
            Kembali ke Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-destructive">
          Error
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Halaman gagal dimuat.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Terjadi kesalahan tak terduga. Coba muat ulang atau kembali ke Dashboard.
        </p>
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="bg-foreground text-background px-4 py-2 text-sm font-semibold"
          >
            Coba lagi
          </button>
          <a href="/" className="border border-foreground px-4 py-2 text-sm font-semibold">
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AI Test Scenario Generator — Alat QA" },
      {
        name: "description",
        content:
          "Ubah dokumen requirement menjadi test scenario yang terstruktur. Alat internal untuk tim QA Engineer.",
      },
      { property: "og:title", content: "AI Test Scenario Generator" },
      {
        property: "og:description",
        content: "Ubah dokumen requirement menjadi test scenario yang terstruktur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <Outlet />
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
