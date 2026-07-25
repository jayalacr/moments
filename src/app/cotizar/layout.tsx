import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cotizar",
  description: "Cotiza tu invitación digital con Moments: elige plan, diseño y recibe tu presupuesto al instante.",
};

export default function CotizarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
