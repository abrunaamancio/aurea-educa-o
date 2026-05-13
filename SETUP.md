# Guia de Configuração — Aurea Portfólio

Este guia explica como colocar a ferramenta no ar do zero. Siga os passos na ordem.  
Tempo estimado total: **25–35 minutos**.

---

## O que você vai precisar criar

| Serviço | Para quê | Gratuito? |
|---|---|---|
| **Supabase** | Banco de dados, login e arquivos dos alunos | Sim (free tier) |
| **Vercel** | Hospedagem do site | Sim (free tier) |
| **Anthropic** | Inteligência artificial (geração de bio etc.) | Pago por uso (~centavos por aluno) |

Os demais serviços (domínio customizado, remoção de fundo de foto) são **opcionais** — a ferramenta funciona sem eles.

---

## Passo 1 — Criar a conta e o projeto no Supabase (~10 min)

1. Acesse **supabase.com** e clique em **Start your project**.
2. Crie uma conta (pode usar login do GitHub ou e-mail).
3. Clique em **New project**.
   - **Organization**: crie ou selecione a sua.
   - **Name**: `aurea-educacao` (ou qualquer nome).
   - **Database Password**: crie uma senha forte e **salve em algum lugar seguro**.
   - **Region**: escolha `South America (São Paulo)`.
4. Aguarde o projeto ser criado (~1 minuto).

### 1a — Criar o banco de dados

1. No menu lateral, clique em **SQL Editor**.
2. Clique em **New query**.
3. Copie o conteúdo inteiro do arquivo `supabase/migrations/001_initial_schema.sql` deste repositório e cole no editor.
4. Clique em **Run** (botão verde).  
   Deve aparecer `Success. No rows returned`.  
   ⚠️ Se aparecer algum erro, copie a mensagem e me envie.

### 1b — Pegar as chaves de API

1. No menu lateral, vá em **Project Settings** > **API**.
2. Copie e salve os seguintes valores:
   - **Project URL** → será `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** (em "Project API keys") → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (em "Project API keys", clique em "Reveal") → será `SUPABASE_SERVICE_ROLE_KEY`

---

## Passo 2 — Pegar a chave da API do Claude (Anthropic) (~5 min)

1. Acesse **console.anthropic.com** e crie uma conta.
2. No menu, vá em **API Keys** > **Create Key**.
3. Dê um nome (ex: `aurea-educacao`) e clique em **Create Key**.
4. Copie a chave (começa com `sk-ant-...`) → será `ANTHROPIC_API_KEY`.
5. Adicione créditos em **Billing** (o uso por turma custa alguns centavos; R$10–20 são suficientes para um semestre inteiro).

---

## Passo 3 — Publicar no Vercel (~10 min)

1. Acesse **vercel.com** e crie uma conta (pode usar login do GitHub).
2. Clique em **Add New > Project**.
3. Em "Import Git Repository", selecione o repositório `aurea-educacao`.
   - Se não aparecer, clique em **Adjust GitHub App Permissions** e autorize o repositório.
4. Na tela de configuração do projeto:
   - **Framework Preset**: deve detectar `Next.js` automaticamente.
   - **Root Directory**: deixe como `.` (raiz).
5. Expanda a seção **Environment Variables** e adicione as seguintes variáveis (uma por vez):

   | Nome da variável | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase (Passo 1b) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase (Passo 1b) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role do Supabase (Passo 1b) |
   | `ANTHROPIC_API_KEY` | Chave da Anthropic (Passo 2) |
   | `NEXT_PUBLIC_APP_URL` | `https://SEU-PROJETO.vercel.app` (preencher depois) |
   | `ADMIN_EMAIL` | Seu e-mail (ex: `professora@aureaeducacao.com.br`) |

6. Clique em **Deploy** e aguarde (~2 minutos).
7. Quando terminar, copie a URL do projeto (algo como `aurea-educacao.vercel.app`).
8. Volte em **Settings > Environment Variables**, edite `NEXT_PUBLIC_APP_URL` e cole a URL real.
9. Vá em **Deployments**, clique nos três pontos do último deploy e clique em **Redeploy** para aplicar a variável.

---

## Passo 4 — Testar se funcionou

1. Abra a URL do seu projeto no navegador.
2. Clique em **Entrar** e crie uma conta com seu e-mail de professora.
3. Acesse a URL `/admin` (ex: `aurea-educacao.vercel.app/admin`).
4. Adicione um e-mail de teste na lista de alunos aprovados.
5. Abra uma aba anônima, faça login com o e-mail de teste e verifique se o assistente abre.

---

## Serviços opcionais

Estes serviços **não são necessários** para a ferramenta funcionar. Podem ser adicionados depois, quando quiser.

### Domínio customizado para os portfólios (Cloudflare Registrar)

Permite que os alunos registrem um domínio próprio (ex: `joaomelo.com`) direto na ferramenta.

Para configurar:
1. Crie conta em **cloudflare.com** e acesse o **Registrar**.
2. Em **API Tokens**, crie um token com permissão de `Registrar: Edit`.
3. Adicione no Vercel:
   - `CLOUDFLARE_API_TOKEN` = token criado
   - `CLOUDFLARE_ACCOUNT_ID` = ID da sua conta (aparece na URL ao acessar o painel)

### Remoção automática de fundo da foto (remove.bg)

Permite que os alunos removam o fundo da foto de perfil com um clique.

Para configurar:
1. Crie conta em **remove.bg** e acesse **API**.
2. Copie a API key e adicione no Vercel:
   - `REMOVE_BG_API_KEY` = chave copiada
3. O plano gratuito do remove.bg inclui 50 imagens/mês (suficiente para testar).

### Publicação automática com domínio customizado (Vercel API)

Permite que o portfólio do aluno seja publicado automaticamente com o domínio dele no Vercel.

Para configurar:
1. No Vercel, vá em **Settings > Tokens** e crie um token.
2. Acesse **Settings > General** e copie o **Project ID**.
3. Adicione no Vercel:
   - `VERCEL_TOKEN` = token criado
   - `VERCEL_PROJECT_ID` = ID do projeto
   - `VERCEL_TEAM_ID` = ID do time (se o projeto estiver em um time; deixe vazio se for conta pessoal)

---

## Dúvidas frequentes

**Posso usar Netlify em vez do Vercel?**  
Não é recomendado. Este projeto usa Next.js 14 com middleware de autenticação e App Router, recursos que têm suporte completo apenas no Vercel (que é desenvolvido pela mesma equipe do Next.js). No Netlify, partes do sistema de login podem não funcionar corretamente.

**Onde configuro o e-mail da professora (administrador)?**  
Na variável de ambiente `ADMIN_EMAIL` no Vercel. Apenas esse e-mail tem acesso ao painel `/admin`.

**O SQL deu erro ao rodar. O que faço?**  
O script foi escrito para ser re-executável sem erros. Se aparecer um erro, geralmente é por conta de extensão UUID não instalada (raro no Supabase). Copie a mensagem de erro exata e me envie.

**Como adiciono alunos à ferramenta?**  
Acesse `/admin` com seu e-mail de professora e cadastre os e-mails dos alunos. Eles recebem acesso por 6 meses a partir da data que você definir.
