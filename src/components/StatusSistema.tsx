import type { SaudeDoSistema } from "../types";

interface Props {
  saude: SaudeDoSistema | null;
}

const NOS: { chave: keyof SaudeDoSistema; rotulo: string; porta: string }[] = [
  { chave: "gateway", rotulo: "api-gateway", porta: ":3000" },
  { chave: "produtos", rotulo: "produtos-service", porta: ":3001" },
  { chave: "pedidos", rotulo: "pedidos-service", porta: ":3002" },
];

/**
 * Painel que mostra, ao vivo, quais microsserviços estão respondendo.
 * Ótimo para a demonstração: derrube um serviço e veja o ponto ficar vermelho.
 *
 * Componente "de apresentação": não tem estado nem busca dados.
 * Só recebe `saude` por props e desenha. (Quem busca é o hook useSaudeDoSistema.)
 */
export function StatusSistema({ saude }: Props) {
  return (
    <ul
      aria-label="Estado dos microsserviços"
      className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[12px]"
    >
      {NOS.map(({ chave, rotulo, porta }) => {
        const estado = saude?.[chave]; // undefined/null enquanto carrega
        const ok = estado === "ok";
        const desconhecido = !estado;

        return (
          <li key={chave} className="flex items-center gap-2">
            <span
              aria-hidden
              className={`inline-block size-2.5 rounded-full ${
                desconhecido
                  ? "bg-linha"
                  : ok
                    ? "ponto-vivo bg-ok text-ok"
                    : "bg-perigo"
              }`}
            />
            <span className="text-tinta">{rotulo}</span>
            <span className="text-tinta-suave">{porta}</span>
            <span className="sr-only">
              {desconhecido ? "verificando" : ok ? "online" : "indisponível"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
