# Comunidad DentalCore

Foro privado para odontólogos latinos. Next.js 15 App Router + Supabase (schema `community`).

## Stack
- **Next.js 15** (App Router, Server Components, Server Actions)
- **Supabase** (auth compartida con DentalCore app principal, schema `community`)
- **Tailwind CSS 3** + Material Symbols
- **Vercel** para deploy en `comunidad.dentalcore.app`

## Setup local

```bash
npm install
cp .env.example .env.local
# rellená NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
# → http://localhost:3100
```

## Supabase

La migration vive en el repo principal: `dentalcore-mvp/supabase/migrations/00052_community_schema.sql`.

Usa el schema `community` (separado de `public`) con RLS en todas las tablas. Auth compartida via `auth.users`.

Todas las queries desde este app deben ir con `.schema('community')`:

```ts
supabase.schema('community').from('posts').select('*')
```

## Deploy

```bash
vercel --prod
```

Variables de entorno en Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_COOKIE_DOMAIN=.dentalcore.app`

Dominio: `comunidad.dentalcore.app` (CNAME a Vercel).

## Estructura

```
src/
├── app/
│   ├── layout.tsx                 # Shell con header
│   ├── page.tsx                   # Feed global
│   ├── login/page.tsx             # Email + password (misma cuenta DentalCore)
│   ├── onboarding/page.tsx        # Completar profile al primer login
│   ├── new/page.tsx               # Crear post
│   ├── c/[slug]/page.tsx          # Feed por categoría
│   ├── p/[id]/page.tsx            # Post detail + comentarios
│   ├── u/[handle]/page.tsx        # Perfil público
│   └── actions.ts                 # Server actions (createPost, comment, like)
├── components/                    # PostCard, CommentList, Nav, etc.
└── lib/
    ├── supabase/
    │   ├── server.ts              # createServerClient (cookies)
    │   └── client.ts              # createBrowserClient
    └── format.ts
```
