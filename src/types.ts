/**
 * Tipos TypeScript que descrevem o formato dos dados devolvidos pela API.
 * Eles espelham os objetos JSON enviados pelos microsserviços, e o compilador
 * avisa se tentarmos usar um campo que não existe (ex.: produto.nom).
 */

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
  categoria: string;
}

export interface Pedido {
  id: number;
  productId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
  status: "CONFIRMADO" | "CANCELADO";
  criadoEm: string; // data em formato ISO 8601
}

/** Resposta do endpoint GET /health do gateway. */
export interface SaudeDoSistema {
  gateway: "ok" | "indisponivel";
  produtos: "ok" | "indisponivel";
  pedidos: "ok" | "indisponivel";
}
