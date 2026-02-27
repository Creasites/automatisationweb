import type { Metadata } from "next";
import HomeClient from "./page.client";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Outils web pour analyser, générer et améliorer un site internet rapidement en France et Belgique francophone.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
