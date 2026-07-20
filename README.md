# LinkedIn Maestria — Leitor e Configurador de Perfil

Ferramenta da **áurea educação** para os alunos do Método Maestria: o aluno envia o perfil atual do LinkedIn e recebe a configuração completa para performar melhor e subir o SSI (Social Selling Index).

## Como o aluno usa (3 passos, sem fricção)

1. **Envia o perfil** por um de três caminhos — prints das seções (o mais simples), o PDF que o próprio LinkedIn exporta ("Mais → Salvar como PDF") ou copiar e colar o texto. Quem envia prints/PDF **não precisa preencher nenhum campo**.
2. **Pega o SSI oficial** — a página tem o link direto para [linkedin.com/sales/ssi](https://www.linkedin.com/sales/ssi) com o passo a passo (abrir logado → tirar print da tela → subir o print junto com os outros). A ferramenta lê os números do print sozinha; digitar é opcional.
3. **Gera a configuração** — os campos de objetivo (área, senioridade, cargo-alvo) são opcionais; quando vazios, a análise infere o posicionamento a partir do próprio perfil.

Com prints, a análise também avalia o que é visual: foto, banner e completude aparente do perfil.

## O que a ferramenta entrega

1. **Diagnóstico dos 4 pilares do SSI** — calibrado no **SSI oficial** do aluno quando ele informa os números de [linkedin.com/sales/ssi](https://www.linkedin.com/sales/ssi) (a página mostra o SSI apenas para a própria pessoa logada, por isso o aluno consulta e digita); sem os números, a ferramenta estima
2. **Headline** — 3 opções prontas, com as boas práticas 2026 (220 caracteres, palavras-chave, posicionamento)
3. **Sobre** — texto completo pronto para colar (gancho nas 3 primeiras linhas, provas, CTA)
4. **Experiências** — exemplo reescrito com bullets de resultado quantificado
5. **Competências** — top 3 para fixar + lista completa alinhada ao posicionamento
6. **Checklist de configuração** — foto, banner, URL, Destaques, recomendações, verificação, Open to Work, setor etc., com status OK / Ajustar / Criar
7. **Estratégia de conexões** — perfis-alvo, mensagem de convite modelo, meta semanal
8. **Plano de publicações** — temas de autoridade, plano de 2 semanas com ganchos prontos, rotina de engajamento

O aluno pode copiar cada bloco individualmente ou baixar o diagnóstico completo em `.md`.

## Arquitetura

```
index.html / styles.css / app.js   → frontend estático (identidade visual áurea)
api/analyze.js                     → função serverless que chama a API da Anthropic
api/_lib/prompt.js                 → prompt-mestre (boas práticas 2026 + SSI + voz da áurea)
```

O conhecimento da ferramenta (boas práticas, pilares do SSI, tom de voz, regras de geração) fica todo em `api/_lib/prompt.js` — para atualizar as instruções do assistente, edite apenas esse arquivo.

## Como publicar (Vercel)

1. Importe este repositório em [vercel.com/new](https://vercel.com/new) (a configuração é detectada automaticamente).
2. Em **Settings → Environment Variables**, adicione:
   - `ANTHROPIC_API_KEY` = sua chave da [console da Anthropic](https://platform.claude.com/)
3. Deploy. A ferramenta fica no ar na URL do projeto.

A chave de API fica **somente no servidor** — nunca é exposta aos alunos.

> Cada análise usa o modelo Claude Opus e leva de 1 a 3 minutos. O custo por análise varia com o tamanho do perfil colado (tipicamente centavos de dólar).

## Rodar localmente

```bash
npm install -g vercel
vercel dev
# exporte a chave antes: export ANTHROPIC_API_KEY=sk-ant-...
```

Acesse `http://localhost:3000`.

## Fontes da marca

As fontes comerciais não estão no repositório. Para ativá-las, adicione em `/fonts`:

- `GranRoyale.woff2` (títulos)
- `Gotham-Book.woff2`, `Gotham-Medium.woff2`, `Gotham-Bold.woff2` (corpo)

Sem os arquivos, a página usa os fallbacks Georgia (títulos) e Montserrat (corpo). A Anton (badges/preços) carrega do Google Fonts.
