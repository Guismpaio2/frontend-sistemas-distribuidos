# Frontend — Gestão de Pedidos

Interface React + TypeScript (Vite, Tailwind CSS v4, axios) do laboratório de **ECOS02A — Sistemas Distribuídos (UNIFEI)**.

O frontend conhece **apenas o API Gateway** (`http://localhost:3000/api`); não sabe que existem os serviços de produtos e pedidos.

**Repositórios do projeto**

| Repositório | Conteúdo |
|---|---|
| [MicroService-SistemasDistribuidos](https://github.com/Guismpaio2/MicroService-SistemasDistribuidos) | Visão geral, `docker-compose.yml`, scripts de inicialização |
| [backend-sistemas-distribuidos](https://github.com/Guismpaio2/backend-sistemas-distribuidos) | Os três microsserviços (gateway, produtos, pedidos) |
| **[frontend-sistemas-distribuidos](https://github.com/Guismpaio2/frontend-sistemas-distribuidos)** | **Este repositório** |

---

## Como executar

Requer **Node.js ≥ 22.15**. A interface precisa do **backend rodando** para mostrar produtos e pedidos (sem ele, a tela exibe "Catálogo indisponível" e o indicador de serviços fica vermelho).

### Só o frontend (backend já está rodando)

```bash
npm install        # só na primeira vez
npm run dev        # http://localhost:5173
```

### Frontend + backend, em 2 terminais

O backend é **outro repositório** ([backend-sistemas-distribuidos](https://github.com/Guismpaio2/backend-sistemas-distribuidos)). Com as duas pastas lado a lado (`backend/` e `frontend/`):

```bash
# terminal 1: os 3 microsserviços juntos
cd backend
npm install && npm run install:all   # só na primeira vez
npm run dev
```

```bash
# terminal 2: a interface
cd frontend
npm install                          # só na primeira vez
npm run dev
```

Abra **http://localhost:5173**.

### Tudo com um único comando

No repositório de orquestração ([MicroService-SistemasDistribuidos](https://github.com/Guismpaio2/MicroService-SistemasDistribuidos)), com `backend/` e `frontend/` dentro da pasta `Laboratorio/`:

```bash
./iniciar.sh          # macOS/Linux      (Windows: .\iniciar.ps1)
# ou
docker compose up --build
```

### Se o gateway estiver em outra porta

O frontend fala **apenas com o gateway**, cujo endereço vem de `VITE_API_URL` (padrão `http://localhost:3000/api`).

```bash
VITE_API_URL=http://localhost:4000/api npm run dev
```

```powershell
$env:VITE_API_URL="http://localhost:4000/api"; npm run dev
```

Para não digitar toda vez, copie `.env.example` para `.env` e edite:

```
VITE_API_URL=http://localhost:4000/api
```

> A porta do **frontend** deve continuar **5173**: é a única origem que o CORS do gateway aceita por padrão (`strictPort` no Vite impede que ele "escolha outra" em silêncio). Para usar outra, defina `CORS_ORIGINS` no gateway.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com recarga instantânea |
| `npm run build` | Verifica tipos e gera `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Análise estática (oxlint) |

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
