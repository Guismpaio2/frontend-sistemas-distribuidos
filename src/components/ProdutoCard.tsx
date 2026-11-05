import { useState } from "react";
import type { CSSProperties } from "react";
import type { Produto } from "../types";
import { codigo, formatarMoeda } from "../utils/formatar";

interface Props {
  produto: Produto;
  indice: number; // posição na lista (só para escalonar a animação de entrada)
  comprando: boolean; // true enquanto o pedido deste produto está sendo enviado
  onComprar: (produto: Produto, quantidade: number) => void;
}

/**
 * Cartão de um produto, no formato de "etiqueta de envio".
 *
 * PROPS: são os "argumentos" do componente. Os dados vêm de cima (App.tsx)
 * e o componente avisa o pai de que algo aconteceu chamando a função
 * `onComprar`. Esse padrão ("dados descem, eventos sobem") é a base do React.
 */
export function ProdutoCard({ produto, indice, comprando, onComprar }: Props) {
  // useState LOCAL: a quantidade escolhida só interessa a ESTE cartão,
  // então o estado mora aqui. Cada cartão tem o seu próprio `quantidade`.
  // Regra prática: coloque o estado no menor componente que precisa dele;
  // "levante-o" para o pai apenas quando outros componentes também precisarem.
  const [quantidade, setQuantidade] = useState(1);

  const esgotado = produto.estoque === 0;

  // Se o estoque diminuir depois de uma compra, a quantidade escolhida
  // não pode passar do que sobrou. Calculamos isso durante a renderização
  // (em vez de um useEffect): um valor DERIVADO não precisa de estado próprio.
  const quantidadeValida = Math.min(quantidade, Math.max(produto.estoque, 1));

  // Barra de estoque: 0% (vazio) até 100% (30 unidades ou mais)
  const nivel = Math.min(100, (produto.estoque / 30) * 100);
  const estoqueBaixo = produto.estoque > 0 && produto.estoque <= 8;

  return (
    <article
      className="etiqueta revelar flex flex-col"
      // `--i` é uma variável CSS lida em index.css para atrasar a animação de cada cartão
      style={{ "--i": indice } as CSSProperties}
    >
      {esgotado && <div className="carimbo">ESGOTADO</div>}

      <header className="flex items-center justify-between border-b border-dashed border-linha px-4 py-2.5 pr-11">
        <span className="font-mono text-[11px] tracking-widest text-tinta-suave">
          SKU {codigo(produto.id)}
        </span>
        <span className="rounded-sm bg-tinta px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wider text-papel-claro uppercase">
          {produto.categoria}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-3 px-4 pt-4 pb-4">
        <h3 className="font-display text-xl leading-snug font-bold text-balance">{produto.nome}</h3>

        <p className="font-mono text-2xl font-bold tracking-tight">{formatarMoeda(produto.preco)}</p>

        <div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-papel"
            role="img"
            aria-label={`${produto.estoque} unidades em estoque`}
          >
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${
                esgotado ? "bg-perigo" : estoqueBaixo ? "bg-sinal" : "bg-ok"
              }`}
              style={{ width: `${nivel}%` }}
            />
          </div>
          <p
            className={`mt-1.5 font-mono text-[11px] ${
              estoqueBaixo ? "font-bold text-sinal-escuro" : "text-tinta-suave"
            }`}
          >
            {esgotado
              ? "sem estoque"
              : estoqueBaixo
                ? `últimas ${produto.estoque} unidades`
                : `${produto.estoque} em estoque`}
          </p>
        </div>

        <div className="mt-auto flex items-stretch gap-2 pt-1">
          {/* Seletor de quantidade: um "componente controlado". O valor mostrado vem
              do estado, e cada clique pede ao React para atualizar esse estado. */}
          <div className="flex items-center rounded-sm border-[1.5px] border-tinta">
            <button
              type="button"
              aria-label="Diminuir quantidade"
              disabled={esgotado || comprando || quantidadeValida <= 1}
              // Usar a forma funcional (valorAnterior => novoValor) é o jeito seguro
              // de atualizar um estado que depende do valor anterior.
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              className="size-9 text-lg leading-none transition-colors hover:bg-papel disabled:opacity-30"
            >
              −
            </button>
            <span className="w-8 text-center font-mono text-sm font-bold" aria-live="polite">
              {quantidadeValida}
            </span>
            <button
              type="button"
              aria-label="Aumentar quantidade"
              disabled={esgotado || comprando || quantidadeValida >= produto.estoque}
              onClick={() => setQuantidade((q) => Math.min(produto.estoque, q + 1))}
              className="size-9 text-lg leading-none transition-colors hover:bg-papel disabled:opacity-30"
            >
              +
            </button>
          </div>

          <button
            type="button"
            disabled={esgotado || comprando}
            onClick={() => onComprar(produto, quantidadeValida)}
            className="flex-1 rounded-sm border-[1.5px] border-tinta bg-sinal px-3 font-bold text-tinta transition-colors hover:bg-sinal-escuro hover:text-papel-claro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta disabled:cursor-not-allowed disabled:border-linha disabled:bg-papel disabled:text-tinta-suave"
          >
            {comprando ? "Enviando…" : esgotado ? "Indisponível" : "Comprar"}
          </button>
        </div>
      </div>
    </article>
  );
}
