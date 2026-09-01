@AGENTS.md

# Sunset Web

Aplicação web (Next.js / React) do **Sunset** — plataforma onde usuários
pesquisam locais com as mais bonitas visões de pôr do sol, postam fotos
marcando o local, curtem, comentam e avaliam os locais para gerar rankings.
Este projeto é o front-end que consome a API .NET (`Sunset.API`).

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS (ou CSS puro por componente — a definir)
- Fetch wrappers próprios em `lib/api/` (sem client HTTP pesado por padrão)

## Identidade visual (do protótipo já aprovado)

- **Cores**: gradiente de pôr do sol — roxo/anil de crepúsculo (`#1e1038`, `#2d1b4e`) até laranja/dourado (`#ff8c5a`, `#ffcf6b`), com rosa de entardecer (`#e85d8a`) como acento. Existe uma versão dark (fundo escuro, padrão) e uma light (fundo em tons de papel/creme, `#fff9f2`).
- **Tipografia**: `Fraunces` (serifada, títulos/display), `Karla` (sans, corpo), `JetBrains Mono` (coordenadas, contadores, dados).
- **Elementos de marca**: disco do sol com glow, linha do horizonte, cards de foto com overlay gradiente escuro na base para legibilidade do texto.
- Referência visual em `prototype/sunset-prototype-dark.html` e `prototype/sunset-prototype-light.html` (mockups estáticos aprovados — abrir direto no navegador).
- **Logos oficiais**: `public/images/logo-horizontal.svg` (ícone + wordmark lado a lado, usado na Navbar), `public/images/logo-vertical.svg` (ícone + wordmark empilhados, usado em telas estreitas como login/register), `app/icon.svg` (ícone isolado, favicon via convenção de arquivo do Next.js). O wordmark das duas primeiras foi recolorido de preto para `--cream` (`#fff6ec`) para ficar legível sobre o fundo escuro padrão do site; o ícone do sol permanece `#f86f02` fixo nas três. Cada uma tem uma variante `-light.svg` (wordmark em `--ink`) para o tema light — ver toggle abaixo.
- **Toggle dark/light**: implementado. `lib/hooks/useTheme.ts` lê/grava `data-theme` em `<html>` + `localStorage("sunset-theme")`; `components/ui/ThemeToggle.tsx` (no Navbar) alterna. Um script inline no `<head>` de `app/layout.tsx` aplica o tema salvo (ou `prefers-color-scheme`) antes da hidratação, evitando flash. Estilização via variant custom `light:` (definido em `app/globals.css` com `@custom-variant`, seletor `[data-theme="light"]`) aplicado por cima das classes dark (padrão) em cada componente — não há troca de significado dos tokens `dusk-*`/`cream`, só overrides pontuais.

## Estrutura de pastas

```
sunset-web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # home (hero + ranking + galeria)
│   ├── locations/
│   │   ├── page.tsx             # busca/lista de locais
│   │   └── [id]/page.tsx        # detalhe do local
│   ├── photos/[id]/page.tsx     # detalhe da foto (comentários)
│   ├── ranking/page.tsx
│   ├── upload/page.tsx          # postar nova foto
│   ├── profile/[id]/page.tsx
│   └── (auth)/
│       ├── login/page.tsx
│       └── register/page.tsx
├── components/
│   ├── ui/                      # Button, SearchBar, Tabs — genéricos, sem lógica de negócio
│   ├── location/                # LocationCard, RankingList, LocationMap
│   ├── photo/                   # PhotoGrid, PhotoCard, LikeButton, CommentList
│   └── layout/                  # Navbar, Footer
├── lib/
│   ├── api/                     # locations.ts, photos.ts, auth.ts — chamadas HTTP
│   ├── hooks/                   # useAuth, useLikePhoto
│   └── utils/                   # formatDate, geolocation
├── types/                       # location.ts, photo.ts, user.ts
└── public/images/
```

Regras:
- Rotas em `app/` refletem 1:1 os recursos da API (`locations/[id]`, `photos/[id]`).
- `components/` organizado por domínio (`location/`, `photo/`), não por tipo genérico.
- Toda chamada HTTP passa por `lib/api/` — nenhum componente chama `fetch` direto pra API.
- Tipos em `types/` espelham as entidades da API (`Location`, `Photo`, `User`, `Comment`, `Rating`).

## Entidades consumidas (vêm da Sunset.API)

| Entidade | Campos principais |
|---|---|
| `User` | id, name, email, avatar_url |
| `Location` | id, name, latitude, longitude, city, avg_rating |
| `Photo` | id, user_id, location_id, image_url, caption, likes_count |
| `Comment` | id, user_id, photo_id, content |
| `Rating` | id, user_id, location_id, score (1–5) |

## Endpoints consumidos (prefixo `/api/v1`)

- `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`
- `GET /users/:id`, `PATCH /users/me`, `GET /users/:id/photos`
- `GET /locations` (`?q=`, `?lat=&lng=&radius=`), `GET /locations/:id`, `POST /locations`
- `GET /locations/:id/photos`, `GET /locations/ranking` (`?period=`)
- `POST /locations/:id/ratings`
- `GET /photos` (`?sort=recent|top`), `POST /photos`, `GET /photos/:id`, `DELETE /photos/:id`
- `POST/DELETE /photos/:id/likes`
- `GET/POST /photos/:id/comments`, `DELETE /comments/:id`

Endpoints "auth" exigem JWT (Bearer token) — o token fica guardado via `useAuth` e injetado nos fetch wrappers de `lib/api/`.

## Decisões de design

- **SSR/SSG**: páginas de local e de foto (`locations/[id]`, `photos/[id]`) devem ser renderizadas no servidor — são a porta de entrada de SEO (busca orgânica por "pôr do sol em X").
- **Upload de imagem**: o fluxo é pedir uma URL pré-assinada à API, subir o arquivo direto pro storage a partir do client, e só então enviar `POST /photos` com a URL resultante — nunca mandar o binário pra própria API.
- **Paginação**: feeds (`/photos`, listagem de `/locations`) usam cursor, então a UI de "carregar mais" deve guardar e reenviar o cursor, não um número de página.
- **Estado de curtida**: otimista na UI (marca como curtido imediatamente ao clicar) com rollback se a chamada falhar.

## Convenções de código

- Componentes em PascalCase, um componente por arquivo, nome do arquivo = nome do componente.
- Hooks customizados prefixados com `use` em `lib/hooks/`.
- Sem lógica de negócio em componentes de `components/ui/` — eles só recebem props e renderizam.
- Nomes de rotas, variáveis e funções em inglês; texto visível ao usuário em português (pt-BR).

## Comandos

- `npm run dev` — inicia o servidor de desenvolvimento (Next.js, Turbopack)
- `npm run build` — build de produção
- `npm run start` — serve o build de produção
- `npm run lint` — ESLint (`eslint-config-next`)
