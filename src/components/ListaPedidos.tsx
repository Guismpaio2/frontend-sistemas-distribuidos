import type { CSSProperties } from "react";
import type { Pedido } from "../types";
import { codigo, formatarDataHora, formatarMoeda } from "../utils/formatar";

interface Props {
  pedidos: Pedido[];
  carregando: boolean;
  erro: string | null;
  onAtualizar: () => void;
}

/**
 * "Livro de pedidos": lista os pedidos já criados.
 * Também é um componente de apresentação: só desenha o que recebe por props.
 */
export function ListaPedidos({ pedidos, carregando, erro, onAtualizar }: Props) {
  const totalGeral = pedidos.reduce((soma, p) => soma + p.total, 0);

  return (
    <section
      aria-labelledby="titulo-pedidos"
      className="rounded-md border-[1.5px] border-tinta bg-papel-claro"
    >
      <header className="flex items-center justify-between border-b-[1.5px] border-tinta px-4 py-3">
        <div>
          <h2 id="titulo-pedidos" className="font-display text-xl font-bold">
            Pedidos
          </h2>
          <p className="font-mono text-[11px] text-tinta-suave">pedidos-service · :3002</p>
        </div>
        <button
          type="button"
          onClick={onAtualizar}
          className="rounded-sm border-[1.5px] border-tinta px-2.5 py-1 font-mono text-xs transition-colors hover:bg-tinta hover:text-papel-claro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
        >
          ↻ atualizar
        </button>
      </header>

      {erro ? (
        <p role="alert" className="m-4 rounded-sm border border-perigo bg-perigo/10 p-3 text-sm text-perigo">
          {erro}
        </p>
      ) : carregando && pedidos.length === 0 ? (
        <p className="p-6 text-center font-mono text-sm text-tinta-suave">carregando…</p>
      ) : pedidos.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-display text-lg italic">Nenhum pedido ainda.</p>
          <p className="mt-1 text-sm text-tinta-suave">
            Clique em <strong>Comprar</strong> em algum produto para criar o primeiro.
          </p>
        </div>
      ) : (
        <>
          <ol className="max-h-[60vh] divide-y divide-dashed divide-linha overflow-y-auto">
            {/* .map() transforma cada item do array em um elemento JSX.
                A prop `key` é obrigatória: ajuda o React a saber qual item é qual
                quando a lista muda. Use sempre um id estável (nunca o índice, se a lista pode mudar). */}
            {pedidos.map((pedido, i) => (
              <li
                key={pedido.id}
                className="revelar px-4 py-3"
                style={{ "--i": Math.min(i, 6) } as CSSProperties}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-sm font-bold">#{codigo(pedido.id)}</span>
                  <span className="font-mono text-sm font-bold">{formatarMoeda(pedido.total)}</span>
                </div>
                <p className="mt-0.5 text-sm">
                  <span className="font-mono text-tinta-suave">{pedido.quantidade}×</span> {pedido.nomeProduto}
                </p>
                <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] text-tinta-suave">
                  <span>{formatarDataHora(pedido.criadoEm)}</span>
                  <span className="rounded-sm border border-ok px-1.5 py-px font-medium tracking-wider text-ok">
                    {pedido.status}
                  </span>
                </div>
              </li>
            ))}
          </ol>
          <footer className="flex justify-between border-t-[1.5px] border-tinta px-4 py-3 font-mono text-sm">
            <span className="text-tinta-suave">
              {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"}
            </span>
            <strong>{formatarMoeda(totalGeral)}</strong>
          </footer>
        </>
      )}
    </section>
  );
}
