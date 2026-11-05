/**
 * ====================================================================
 *  App.tsx — o componente principal. LEIA ESTE ARQUIVO COM CALMA.
 * ====================================================================
 *
 * Aqui aprendemos como o React se conecta a uma API usando HOOKS.
 *
 * O QUE É UM HOOK?
 *   Uma função especial (nome começa com "use") que dá "superpoderes" a um
 *   componente de função: guardar memória (useState), executar código em
 *   momentos certos (useEffect), memorizar funções (useCallback), etc.
 *
 * REGRAS DOS HOOKS (o React reclama se você as quebrar):
 *   1. Só chame hooks no TOPO do componente (nunca dentro de if, for ou funções aninhadas).
 *   2. Só chame hooks dentro de componentes ou de outros hooks (custom hooks).
 *
 * O FLUXO DESTA TELA, EM RESUMO:
 *
 *   1. O componente aparece na tela (1ª renderização), com listas vazias.
 *   2. O useEffect dispara e chama a API via axios (React -> Gateway -> serviços).
 *   3. A resposta chega e chamamos setProdutos/setPedidos (useState).
 *   4. Mudar o estado faz o React RE-RENDERIZAR e a lista aparece.
 *   5. O usuário clica em "Comprar" -> POST /api/pedidos -> recarregamos os dados -> tela atualizada.
 */

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { criarPedido, listarPedidos, listarProdutos, mensagemDeErro } from "./api";
import { Aviso } from "./components/Aviso";
import type { AvisoMensagem } from "./components/Aviso";
import { ListaPedidos } from "./components/ListaPedidos";
import { ProdutoCard } from "./components/ProdutoCard";
import { StatusSistema } from "./components/StatusSistema";
import { useSaudeDoSistema } from "./hooks/useSaudeDoSistema";
import type { Pedido, Produto } from "./types";
import { formatarMoeda } from "./utils/formatar";

export default function App() {
  // ------------------------------------------------------------------
  //  useState — a "memória" do componente
  // ------------------------------------------------------------------
  // Sintaxe:  const [valor, setValor] = useState(valorInicial);
  //
  // - `valor` é o que você LÊ para desenhar a tela.
  // - `setValor(novo)` é como você ALTERA. Nunca altere `valor` diretamente
  //   (ex.: produtos.push(...)): o React só sabe que precisa redesenhar quando
  //   você chama a função "set".
  // - Os genéricos <Produto[]> dizem ao TypeScript o que esse estado guarda.

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  // Estados auxiliares: o carregamento e os erros também fazem parte da interface.
  // Uma tela real precisa de três momentos: carregando, deu erro, deu certo.
  const [carregando, setCarregando] = useState(true);
  const [erroProdutos, setErroProdutos] = useState<string | null>(null);
  const [erroPedidos, setErroPedidos] = useState<string | null>(null);

  // Qual produto está sendo comprado agora? (null = nenhum). Usado para desabilitar o botão.
  const [comprandoId, setComprandoId] = useState<number | null>(null);

  // Mensagem flutuante de sucesso/erro após uma compra.
  const [aviso, setAviso] = useState<AvisoMensagem | null>(null);

  // Nosso custom hook (veja hooks/useSaudeDoSistema.ts): ele mesmo usa useState + useEffect.
  const saude = useSaudeDoSistema();

  // ------------------------------------------------------------------
  //  useCallback — memoriza uma função entre renderizações
  // ------------------------------------------------------------------
  // Toda vez que o componente re-renderiza, as funções declaradas dentro dele
  // são recriadas (viram "outra" função, mesmo com o mesmo código).
  // Isso importa porque o useEffect abaixo DEPENDE de `carregarDados`:
  // se ela mudasse a cada renderização, o efeito rodaria em loop infinito.
  // O useCallback com array vazio ([]) garante que a função seja criada uma só vez.
  const carregarDados = useCallback(async () => {
    // Promise.allSettled dispara as duas requisições EM PARALELO e espera ambas
    // terminarem, sem importar se deram certo ou erro. Assim, se o produtos-service
    // estiver fora do ar, a lista de pedidos ainda carrega (falha parcial, como em
    // sistemas distribuídos reais).
    const [resProdutos, resPedidos] = await Promise.allSettled([
      listarProdutos(),
      listarPedidos(),
    ]);

    if (resProdutos.status === "fulfilled") {
      setProdutos(resProdutos.value);
      setErroProdutos(null);
    } else {
      setErroProdutos(mensagemDeErro(resProdutos.reason));
    }

    if (resPedidos.status === "fulfilled") {
      setPedidos(resPedidos.value);
      setErroPedidos(null);
    } else {
      setErroPedidos(mensagemDeErro(resPedidos.reason));
    }

    setCarregando(false);
  }, []);

  // ------------------------------------------------------------------
  //  useEffect — executar código em resposta a "acontecimentos"
  // ------------------------------------------------------------------
  // Sintaxe:  useEffect(() => { ...efeito... ; return () => { ...limpeza... } }, [dependências]);
  //
  // O array de dependências controla QUANDO o efeito roda:
  //   []          -> uma vez, quando o componente aparece pela primeira vez (é o nosso caso)
  //   [a, b]      -> na primeira vez E sempre que `a` ou `b` mudarem
  //   (omitido)   -> a cada renderização (quase sempre um erro!)
  //
  // Por que buscar dados aqui e não direto no corpo do componente?
  // O corpo do componente roda a CADA renderização. Uma chamada de rede ali
  // dispararia nova requisição, que mudaria o estado, que re-renderizaria, que
  // dispararia nova requisição... um loop infinito. O useEffect evita isso.
  //
  // Nota: em desenvolvimento, o <StrictMode> (main.tsx) roda efeitos DUAS vezes
  // de propósito, para ajudar a achar bugs. Em produção roda uma só.
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Efeito com LIMPEZA: some com o aviso depois de 5 segundos.
  // Esse efeito roda toda vez que `aviso` muda. Se o usuário gerar um novo aviso
  // antes dos 5 s, a função de limpeza cancela o timer antigo (clearTimeout).
  useEffect(() => {
    if (!aviso) return;
    const timer = setTimeout(() => setAviso(null), 5000);
    return () => clearTimeout(timer);
  }, [aviso]);

  // ------------------------------------------------------------------
  //  Manipulador de evento — o que acontece quando o usuário clica em "Comprar"
  // ------------------------------------------------------------------
  // Este componente (App) é o "dono" dos dados, então a lógica de compra mora aqui
  // e é passada ao ProdutoCard pela prop `onComprar`.
  async function comprar(produto: Produto, quantidade: number) {
    setComprandoId(produto.id); // 1) liga o estado "enviando" (o botão muda para "Enviando…")
    try {
      // 2) POST /api/pedidos -> Gateway -> pedidos-service -> (HTTP) produtos-service
      const pedido = await criarPedido(produto.id, quantidade);

      setAviso({
        tipo: "sucesso",
        texto: `Pedido #${pedido.id} confirmado: ${quantidade}× ${produto.nome} (${formatarMoeda(pedido.total)}).`,
      });

      // 3) O estoque mudou no produtos-service e há um pedido novo no pedidos-service.
      //    Recarregamos tudo para a tela refletir o que REALMENTE está nos serviços.
      await carregarDados();
    } catch (erro) {
      // Mensagens do backend (estoque insuficiente, serviço indisponível...) chegam aqui.
      setAviso({ tipo: "erro", texto: mensagemDeErro(erro) });
      await carregarDados(); // o estoque exibido pode estar desatualizado
    } finally {
      setComprandoId(null); // 4) sempre desliga o "enviando", dando certo ou errado
    }
  }

  // ------------------------------------------------------------------
  //  JSX — o que vai para a tela
  // ------------------------------------------------------------------
  // JSX parece HTML, mas é JavaScript. Dentro de { } você coloca qualquer expressão.
  // Quando um estado muda, o React chama esta função de novo e atualiza só o que mudou.
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-6 lg:pt-12">
      <header className="revelar mb-10 border-b-[1.5px] border-tinta pb-6" style={{ "--i": 0 } as CSSProperties}>
        <p className="font-mono text-[11px] tracking-[0.2em] text-sinal-escuro uppercase">
          ECOS02A · Sistemas Distribuídos · UNIFEI
        </p>
        <h1 className="mt-2 font-display text-5xl leading-[1.02] font-bold tracking-tight sm:text-6xl">
          Gestão de <em className="font-medium text-sinal">Pedidos</em>
        </h1>
        <p className="mt-3 max-w-xl text-tinta-suave">
          Um protótipo de microsserviços: o React fala só com o gateway, que roteia para os serviços
          de produtos e pedidos.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <StatusSistema saude={saude} />
          <p className="font-mono text-[11px] text-tinta-suave">
            React :5173 → gateway :3000 → serviços
          </p>
        </div>
      </header>

      <main className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start">
        <section aria-labelledby="titulo-produtos">
          <div className="mb-5 flex items-baseline justify-between">
            <div>
              <h2 id="titulo-produtos" className="font-display text-2xl font-bold">
                Produtos
              </h2>
              <p className="font-mono text-[11px] text-tinta-suave">produtos-service · :3001</p>
            </div>
            {!carregando && !erroProdutos && (
              <span className="font-mono text-xs text-tinta-suave">{produtos.length} itens</span>
            )}
          </div>

          {/* Renderização condicional: escolhemos O QUE desenhar conforme o estado atual. */}
          {carregando ? (
            <p className="font-mono text-sm text-tinta-suave">carregando produtos…</p>
          ) : erroProdutos ? (
            <div role="alert" className="rounded-md border-[1.5px] border-perigo bg-perigo/10 p-5">
              <p className="font-display text-lg font-bold text-perigo">Catálogo indisponível</p>
              <p className="mt-1 text-sm">{erroProdutos}</p>
              <button
                type="button"
                onClick={carregarDados}
                className="mt-3 rounded-sm border-[1.5px] border-tinta bg-papel-claro px-3 py-1.5 text-sm font-bold hover:bg-tinta hover:text-papel-claro"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {produtos.map((produto, indice) => (
                <ProdutoCard
                  key={produto.id}
                  produto={produto}
                  indice={indice}
                  comprando={comprandoId === produto.id}
                  onComprar={comprar}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-6">
          <ListaPedidos
            pedidos={pedidos}
            carregando={carregando}
            erro={erroPedidos}
            onAtualizar={carregarDados}
          />
        </aside>
      </main>

      <Aviso aviso={aviso} onFechar={() => setAviso(null)} />
    </div>
  );
}
