export interface AvisoMensagem {
  tipo: "sucesso" | "erro";
  texto: string;
}

interface Props {
  aviso: AvisoMensagem | null;
  onFechar: () => void;
}

/** Notificação flutuante (toast) para confirmar compras ou explicar falhas. */
export function Aviso({ aviso, onFechar }: Props) {
  if (!aviso) return null; // sem aviso, o componente não desenha nada

  const erro = aviso.tipo === "erro";

  return (
    <div
      role={erro ? "alert" : "status"}
      className={`aviso-entrada fixed right-4 bottom-4 left-4 z-50 mx-auto flex max-w-md items-start gap-3 rounded-md border-[1.5px] border-tinta px-4 py-3 shadow-[4px_4px_0_var(--color-tinta)] sm:right-6 sm:bottom-6 sm:left-auto ${
        erro ? "bg-perigo text-papel-claro" : "bg-ok text-papel-claro"
      }`}
    >
      <span aria-hidden className="font-mono text-lg leading-none">
        {erro ? "!" : "✓"}
      </span>
      <p className="flex-1 text-sm leading-snug font-medium">{aviso.texto}</p>
      <button
        type="button"
        onClick={onFechar}
        aria-label="Fechar aviso"
        className="font-mono text-lg leading-none opacity-80 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
