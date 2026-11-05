import axios from "axios";
import type { Pedido, Produto, SaudeDoSistema } from "./types";

/**
 * Camada de acesso à API.
 *
 * Repare que o frontend conhece UM único endereço: o do API Gateway.
 * Ele não sabe que existem um produtos-service (3001) e um pedidos-service (3002);
 * é o gateway que decide para onde encaminhar cada requisição.
 */
const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

// Instância do axios já configurada (endereço base e tempo máximo de espera).
const http = axios.create({ baseURL: API_URL, timeout: 8000 });

export async function listarProdutos(): Promise<Produto[]> {
  const resposta = await http.get<Produto[]>("/produtos");
  return resposta.data;
}

export async function listarPedidos(): Promise<Pedido[]> {
  const resposta = await http.get<Pedido[]>("/pedidos");
  return resposta.data;
}

export async function criarPedido(productId: number, quantidade: number): Promise<Pedido> {
  const resposta = await http.post<Pedido>("/pedidos", { productId, quantidade });
  return resposta.data;
}

/**
 * Consulta o health check agregado do gateway (fica em /health, fora de /api).
 * Usamos validateStatus para que um 503 ("sistema degradado") NÃO vire exceção:
 * nesse caso o corpo da resposta ainda nos diz qual serviço caiu.
 */
export async function consultarSaude(): Promise<SaudeDoSistema> {
  const urlBase = API_URL.replace(/\/api\/?$/, "");
  try {
    const resposta = await axios.get(`${urlBase}/health`, {
      timeout: 3000,
      validateStatus: () => true,
    });
    const deps = resposta.data?.dependencias ?? {};
    return {
      gateway: "ok",
      produtos: deps["produtos-service"] === "ok" ? "ok" : "indisponivel",
      pedidos: deps["pedidos-service"] === "ok" ? "ok" : "indisponivel",
    };
  } catch {
    // Nem o gateway respondeu: tudo fica "indisponível" do ponto de vista do usuário.
    return { gateway: "indisponivel", produtos: "indisponivel", pedidos: "indisponivel" };
  }
}

/** Extrai uma mensagem amigável de qualquer erro vindo do axios. */
export function mensagemDeErro(erro: unknown): string {
  if (axios.isAxiosError(erro)) {
    // O backend responde { erro: "..." } com mensagem em português.
    const doServidor = erro.response?.data?.erro;
    if (typeof doServidor === "string") return doServidor;
    if (!erro.response) return "Não foi possível falar com o API Gateway. Ele está rodando?";
  }
  return "Ocorreu um erro inesperado.";
}
