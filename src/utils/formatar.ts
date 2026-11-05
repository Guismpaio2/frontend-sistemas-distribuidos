const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** 4599.9 -> "R$ 4.599,90" */
export function formatarMoeda(valor: number): string {
  return moeda.format(valor);
}

/** "2026-11-05T18:37:02.614Z" -> "05/11 · 15:37" (no fuso horário do navegador) */
export function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  const dia = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${dia} · ${hora}`;
}

/** 7 -> "0007" */
export function codigo(id: number): string {
  return String(id).padStart(4, "0");
}
