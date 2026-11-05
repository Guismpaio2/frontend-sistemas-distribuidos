# Frontend — Gestão de Pedidos

Interface React + TypeScript (Vite, Tailwind CSS v4, axios) do laboratório de **ECOS02A — Sistemas Distribuídos (UNIFEI)**.

O frontend conhece **apenas o API Gateway** (`http://localhost:3000/api`); não sabe que existem os serviços de produtos e pedidos.

## Executando

Requer **Node.js ≥ 22.15** e o backend rodando (veja `Laboratorio/readme.md`).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com recarga instantânea |
| `npm run build` | Verifica tipos e gera `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Análise estática (oxlint) |

### Configuração

Copie `.env.example` para `.env` para mudar o endereço do gateway:

```
VITE_API_URL=http://localhost:3000/api
```

## Para estudar (guia de leitura)

O código foi comentado para ensinar React. Leia nesta ordem:

| # | Arquivo | O que você aprende |
|---|---|---|
| 1 | `src/types.ts` | Tipos TypeScript que descrevem os dados da API |
| 2 | `src/api.ts` | Como o axios fala com o gateway |
| 3 | **`src/App.tsx`** | **`useState`, `useEffect`, `useCallback`**, renderização condicional, eventos |
| 4 | `src/hooks/useSaudeDoSistema.ts` | **Custom hook**, `useEffect` com função de limpeza (`setInterval`) |
| 5 | `src/components/ProdutoCard.tsx` | Props, estado local, componentes controlados, valores derivados |
| 6 | `src/components/ListaPedidos.tsx` | `.map()` com `key`, listas e estados vazios |
| 7 | `src/components/Aviso.tsx` | Renderização condicional (`return null`) |

## Estrutura

```
src/
├── App.tsx                  componente principal (estado + efeitos)
├── api.ts                   chamadas HTTP
├── types.ts                 interfaces TypeScript
├── components/              ProdutoCard, ListaPedidos, StatusSistema, Aviso
├── hooks/useSaudeDoSistema.ts
├── utils/formatar.ts        moeda, data, códigos
└── index.css                tokens de design (Tailwind @theme) e animações
```

## Convenção de commits

[Conventional Commits](https://www.conventionalcommits.org/pt-br/): `feat(ui): ...`, `fix(api): ...`, `style: ...`, `docs: ...`, `build: ...`.
