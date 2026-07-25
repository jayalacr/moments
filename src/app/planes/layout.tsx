import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planes",
  description: "Compara los planes Essential, Plus y Deluxe de Moments y elige la experiencia ideal para tu evento.",
};

export default function PlanesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
