# Aurea Educação — Portfolio Generator

Ferramenta para criação de portfólios profissionais dos alunos da Aurea Educação. O aluno passa por um wizard de 6 etapas e publica um site com domínio próprio — sem precisar saber de tecnologia.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Supabase** — auth, banco de dados, storage
- **Claude API** — análise de brandbook + geração de bio
- **Vercel** — hospedagem multi-tenant com domínios customizados
- **Cloudflare Registrar API** — busca e registro de domínios

## Configuração

```bash
cp .env.local.example .env.local
# preencher as variáveis de ambiente

npm install
npm run dev
```

## Banco de dados

Rodar a migration no Supabase:

```sql
-- supabase/migrations/001_initial_schema.sql
```

Criar bucket `portfolio-assets` no Supabase Storage (público).

## Estrutura

```
app/
  (wizard)/wizard/   — 6 etapas do wizard
  (portfolio)/[domain]/ — portfólios publicados (multi-tenant)
  dashboard/         — CMS pós-publicação
  admin/             — painel da professora
  api/               — rotas: AI, domínio, deploy, storage
components/
  wizard/            — componentes do wizard
  portfolio/         — seções dos portfólios (hero, about, projects, footer)
  ui/                — button, input, textarea
lib/
  supabase/          — client, server, types
supabase/migrations/ — schema SQL
```

## Variáveis de ambiente necessárias

Ver `.env.local.example`.
