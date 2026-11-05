import { useEffect, useState } from "react";
import { consultarSaude } from "../api";
import type { SaudeDoSistema } from "../types";

const INTERVALO_MS = 4000;

/**
 * ============================================================
 *  HOOK PERSONALIZADO (custom hook)
 * ============================================================
 * Um custom hook é só uma função cujo nome começa com "use" e que
 * chama outros hooks dentro dela. Serve para ISOLAR uma lógica
 * (aqui: "perguntar ao gateway se o sistema está saudável de tempos em tempos")
 * e reutilizá-la em qualquer componente, sem poluir o App.tsx.
 *
 * Uso:   const saude = useSaudeDoSistema();
 */
export function useSaudeDoSistema(): SaudeDoSistema | null {
  // useState: guarda um valor que, quando muda, faz o React redesenhar o componente.
  //   - `saude` é o valor atual (começa em null = "ainda não sei")
  //   - `setSaude` é a única forma correta de alterá-lo
  const [saude, setSaude] = useState<SaudeDoSistema | null>(null);

  // useEffect: executa um "efeito colateral" DEPOIS que o componente aparece na tela.
  // Efeitos colaterais são coisas que acontecem fora do desenho da tela:
  // chamadas de rede, timers, listeners de eventos...
  useEffect(() => {
    // Evita atualizar o estado se o componente já foi removido da tela
    // (por exemplo, enquanto a requisição ainda estava em andamento).
    let ativo = true;

    async function verificar() {
      const resultado = await consultarSaude();
      if (ativo) setSaude(resultado);
    }

    verificar(); // primeira checagem imediata
    const timer = setInterval(verificar, INTERVALO_MS); // e depois a cada 4 s

    // FUNÇÃO DE LIMPEZA: o React a executa quando o componente sai da tela.
    // Sem ela, o setInterval continuaria rodando para sempre ("vazamento de memória").
    return () => {
      ativo = false;
      clearInterval(timer);
    };

    // Array de dependências VAZIO ([]) = "execute este efeito só uma vez, ao montar".
  }, []);

  return saude;
}
