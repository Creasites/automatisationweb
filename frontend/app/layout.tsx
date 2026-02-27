import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://automatisationweb.vercel.app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Creasites | Outils web pour créer et optimiser un site",
    template: "%s | Creasites",
  },
  description:
    "Plateforme d'outils web pour analyser, créer et améliorer un site rapidement. Ciblé France et Belgique francophone.",
  keywords: [
    "outils web",
    "seo",
    "analyse site web",
    "générateur web",
    "création site web",
    "France",
    "Belgique francophone",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/",
      "fr-BE": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["fr_BE"],
    url: siteUrl,
    siteName: "Creasites",
    title: "Creasites | Outils web pour créer et optimiser un site",
    description:
      "Plateforme d'outils web pour analyser, créer et améliorer un site rapidement en France et Belgique francophone.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creasites | Outils web pour créer et optimiser un site",
    description:
      "Plateforme d'outils web pour analyser, créer et améliorer un site rapidement en France et Belgique francophone.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Creasites",
    url: siteUrl,
    inLanguage: ["fr-FR", "fr-BE"],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Creasites",
    url: siteUrl,
  };

  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
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
