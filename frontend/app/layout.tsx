import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Creasites",
  description: "Plateforme modulaire d'outils web simples et utiles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6">
          <header className="sticky top-3 z-20 mb-8 rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/" className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
                  C
                </span>
                <span className="text-xl font-bold tracking-tight">Creasites</span>
              </Link>

              <nav className="flex flex-wrap items-center gap-2 text-sm">
                <Link href="/" className="rounded-md border border-gray-200 px-3 py-1.5 font-medium">
                  Accueil
                </Link>
                <Link href="/a-propos" className="rounded-md border border-gray-200 px-3 py-1.5 font-medium">
                  À propos
                </Link>
                <Link href="/tarifs" className="rounded-md border border-gray-200 px-3 py-1.5 font-medium">
                  Tarifs
                </Link>
                <Link href="/compte" className="rounded-md border border-gray-200 px-3 py-1.5 font-medium">
                  Compte
                </Link>
                <Link href="/connexion" className="rounded-md border border-gray-200 px-3 py-1.5 font-medium">
                  Connexion
                </Link>
                <Link
                  href="/tools/site-analyzer"
                  className="rounded-md bg-black px-3 py-1.5 font-medium text-white"
                >
                  Commencer
                </Link>
              </nav>
            </div>
          </header>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">{children}</div>
        </div>
      </body>
    </html>
  );
}
