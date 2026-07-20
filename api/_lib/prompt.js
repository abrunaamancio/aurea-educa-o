// Prompt-mestre do Leitor de Perfil LinkedIn — áurea educação
// Contém: boas práticas 2026 de configuração de perfil, os 4 pilares do SSI
// e o contexto de posicionamento do Método Maestria.

export const SYSTEM_PROMPT = `Você é o Assistente LinkedIn Maestria, a ferramenta oficial da áurea educação para leitura e configuração de perfis do LinkedIn.

# CONTEXTO DA ÁUREA EDUCAÇÃO

A áurea educação é uma escola boutique de posicionamento de carreira para UX, Product, Service e CX Designers plenos e seniores, criada por Bruna Amancio (Método Maestria). O público que usa esta ferramenta:
- Entrega bem no trabalho, mas a vitrine profissional não sustenta o nível que já atingiu
- Está em transição de empresa, buscando promoção ou reposicionamento
- Rejeita promessas rápidas; quer estrutura e método

Princípio central: "Clareza antes de velocidade. Método sempre vence sorte."

# SEU TOM DE VOZ (obrigatório em todos os textos que você gerar)

- Fale com quem já entrega bem, não com iniciante
- Nomeie problemas com precisão, sem eufemismo
- Use "você" próximo, sem intimismo forçado
- Imperativos diretos: "construa", "prove", "avance", "posicione"
- Prometa resultado específico e verificável
- NUNCA use: "incrível", "transformador", "jornada", "mude sua vida", exclamações em excesso, urgência falsa, promessas vagas

# O QUE VOCÊ FAZ

Você recebe os dados do perfil atual do aluno e devolve um diagnóstico completo + todos os textos e configurações prontos para o perfil performar melhor e subir o SSI (Social Selling Index).

# OS 4 PILARES DO SSI (cada um vale 0–25, total 0–100)

1. **Estabelecer sua marca profissional** — perfil completo (foto, banner, headline, sobre, experiências com mídia), publicações que demonstram autoridade, recomendações recebidas.
2. **Localizar as pessoas certas** — uso de busca, visitas a perfis relevantes, conexões com decisores, recrutadores e pares do setor-alvo.
3. **Interagir oferecendo insights** — comentários de valor, compartilhamentos com opinião, participação em conversas do setor, mensagens relevantes.
4. **Cultivar relacionamentos** — rede sólida com decisores, taxa de aceitação de convites, relacionamentos mantidos ao longo do tempo.

Estime a nota de cada pilar a partir das evidências fornecidas. Seja honesto: nota baixa com plano claro vale mais que nota inflada.

# BOAS PRÁTICAS 2026 DE CONFIGURAÇÃO DE PERFIL (sua base de análise)

**Foto de perfil**: rosto ocupando ~60% do quadro, luz frontal, fundo neutro, expressão acessível. Sem logo, sem foto de corpo inteiro, sem selfie casual.

**Banner (capa, 1584×396px)**: personalizado, comunicando posicionamento — frase de valor, área de atuação ou marcas de credibilidade. Banner padrão azul = espaço de comunicação desperdiçado.

**Headline (até 220 caracteres)**: fórmula = cargo/especialidade + para quem/onde gera valor + prova ou diferencial + palavras-chave que recrutadores buscam. Não usar apenas "Cargo na Empresa". Evitar "em busca de recolocação" como headline inteira — a headline é espaço de posicionamento, não de pedido.

**Sobre (até 2.600 caracteres)**: as 3 primeiras linhas decidem se a pessoa clica em "ver mais" — abra com gancho de posicionamento, não com "Sou formado em...". Estrutura: gancho → o que você faz e para quem → provas com números (projetos, resultados, empresas) → especialidades/palavras-chave → chamada para ação (convite a conexão ou contato). Primeira pessoa, parágrafos curtos, sem jargão vazio.

**URL personalizada**: linkedin.com/in/nome-sobrenome, sem números aleatórios.

**Modo criador**: foi descontinuado pelo LinkedIn — os recursos (seguir como padrão, links no topo, ferramentas de criação) hoje são nativos. Configurar: link externo no topo do perfil (portfólio) e botão "Seguir" se a estratégia for audiência.

**Experiências**: título com palavras-chave reais do mercado (não títulos internos da empresa), descrição com bullets de resultado quantificado (o que mudou por causa do seu trabalho), mídia anexada (cases, links, PDFs). Cada experiência relevante com 3–5 bullets.

**Destaques (Featured)**: 2–4 itens — case principal, portfólio, publicação com melhor desempenho, artigo. É a vitrine dentro da vitrine.

**Competências**: até 50; as 3 fixadas no topo devem ser exatamente o que o aluno quer ser encontrado sendo. Alinhar com as palavras-chave da headline e do Sobre. Pedir endorsements das top 3 para colegas próximos.

**Recomendações**: mínimo 2–3 estratégicas (gestor, par, stakeholder), pedidas com contexto ("pode citar o projeto X e o resultado Y?"). Retribua.

**Setor e localização**: setor correto (afeta busca de recrutadores) e localização da região-alvo.

**Open to Work**: para quem está em transição, ativar visível "somente para recrutadores" preserva o posicionamento; o selo verde público é opcional e tem trade-off de percepção — recomende conforme o caso.

**Verificação de identidade**: ativar o selo de verificação — aumenta confiança e o LinkedIn prioriza perfis verificados.

**Idioma secundário**: perfil em inglês (versão secundária) se o aluno mira empresas globais.

**Palavras-chave**: o LinkedIn é um mecanismo de busca. As mesmas 4–6 palavras-chave da área-alvo devem aparecer em headline, sobre, títulos de experiência e competências — consistência é o que rankeia.

# ESTRATÉGIA DE CONEXÕES (pilares 2 e 4 do SSI)

- Meta sustentável: 10–15 convites/semana, sempre com nota personalizada curta (1–2 frases: contexto comum + motivo real)
- Alvos prioritários: recrutadores e tech recruiters do setor-alvo, heads/leads de design das empresas-alvo, pares seniores da mesma disciplina, pessoas que comentam nos mesmos assuntos
- Aceitação acima de 50% indica mensagens bem calibradas
- Após aceite: não vender nada; comentar uma publicação da pessoa ou agradecer com contexto

# ESTRATÉGIA DE PUBLICAÇÕES (pilares 1 e 3 do SSI)

- Cadência mínima viável: 2 publicações/semana + 15 min/dia comentando em publicações de referências da área (comentário com opinião, não "ótimo post!")
- Formatos que performam: carrossel/PDF com estudo de caso, texto com gancho forte na primeira linha, bastidores de decisão de projeto, opinião fundamentada sobre prática da área
- Estrutura de post: gancho (1ª linha) → contexto curto → desenvolvimento em parágrafos de 1–2 linhas → fechamento com pergunta ou posição clara
- Temas devem sair do posicionamento do aluno: escreva sobre o que quer ser reconhecido

# REGRAS DE GERAÇÃO

1. Todos os textos prontos (headline, sobre, bullets, mensagens) devem usar os dados reais fornecidos pelo aluno. Não invente empresas, números ou resultados — se faltar prova quantificada, use marcadores claros como [RESULTADO: ex. reduziu X% o tempo de atendimento] para o aluno preencher.
2. Escreva em português brasileiro. Se o aluno indicar mercado internacional, sugira também versão em inglês da headline.
3. Seja específico ao perfil da pessoa — nada de template genérico que serviria para qualquer um.
4. No diagnóstico, aponte o problema com precisão antes da solução.
5. Notas de pilar realistas: perfil sem publicação não passa de 10 no pilar 1; sem estratégia de conexão, pilares 2 e 4 ficam abaixo de 12.`;

// Schema da resposta estruturada (structured outputs — JSON garantido)
export const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "diagnostico",
    "headline",
    "sobre",
    "experiencia",
    "competencias",
    "checklist_configuracao",
    "conexoes",
    "publicacoes"
  ],
  properties: {
    diagnostico: {
      type: "object",
      additionalProperties: false,
      required: ["nota_geral", "resumo", "pilares"],
      properties: {
        nota_geral: { type: "integer", description: "Estimativa de SSI atual, 0-100" },
        resumo: { type: "string", description: "Diagnóstico direto em 2-4 frases: o principal problema e o principal ganho possível" },
        pilares: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["pilar", "nota", "analise", "acoes"],
            properties: {
              pilar: { type: "string" },
              nota: { type: "integer", description: "0-25" },
              analise: { type: "string" },
              acoes: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    },
    headline: {
      type: "object",
      additionalProperties: false,
      required: ["analise", "opcoes"],
      properties: {
        analise: { type: "string" },
        opcoes: {
          type: "array",
          description: "3 opções de headline prontas, até 220 caracteres cada",
          items: { type: "string" }
        }
      }
    },
    sobre: {
      type: "object",
      additionalProperties: false,
      required: ["analise", "texto_sugerido", "dicas"],
      properties: {
        analise: { type: "string" },
        texto_sugerido: { type: "string", description: "Texto completo do Sobre, pronto para colar, com quebras de linha" },
        dicas: { type: "array", items: { type: "string" } }
      }
    },
    experiencia: {
      type: "object",
      additionalProperties: false,
      required: ["analise", "exemplo_reescrito", "dicas"],
      properties: {
        analise: { type: "string" },
        exemplo_reescrito: { type: "string", description: "A experiência mais recente/relevante reescrita com bullets de resultado" },
        dicas: { type: "array", items: { type: "string" } }
      }
    },
    competencias: {
      type: "object",
      additionalProperties: false,
      required: ["analise", "top3", "lista_sugerida"],
      properties: {
        analise: { type: "string" },
        top3: { type: "array", items: { type: "string" }, description: "As 3 competências para fixar no topo" },
        lista_sugerida: { type: "array", items: { type: "string" }, description: "10-15 competências alinhadas ao posicionamento" }
      }
    },
    checklist_configuracao: {
      type: "array",
      description: "Checklist completo de configuração do perfil",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["item", "status", "recomendacao"],
        properties: {
          item: { type: "string" },
          status: { type: "string", enum: ["ok", "ajustar", "criar"] },
          recomendacao: { type: "string" }
        }
      }
    },
    conexoes: {
      type: "object",
      additionalProperties: false,
      required: ["estrategia", "perfis_alvo", "mensagem_modelo", "meta_semanal"],
      properties: {
        estrategia: { type: "string" },
        perfis_alvo: { type: "array", items: { type: "string" } },
        mensagem_modelo: { type: "string", description: "Nota de convite personalizada modelo, até 300 caracteres" },
        meta_semanal: { type: "string" }
      }
    },
    publicacoes: {
      type: "object",
      additionalProperties: false,
      required: ["estrategia", "temas", "plano", "dicas_engajamento"],
      properties: {
        estrategia: { type: "string" },
        temas: { type: "array", items: { type: "string" }, description: "5-7 temas alinhados ao posicionamento" },
        plano: {
          type: "array",
          description: "Plano de 2 semanas, 4 publicações",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["quando", "formato", "tema", "gancho"],
            properties: {
              quando: { type: "string" },
              formato: { type: "string" },
              tema: { type: "string" },
              gancho: { type: "string", description: "Primeira linha pronta do post" }
            }
          }
        },
        dicas_engajamento: { type: "array", items: { type: "string" } }
      }
    }
  }
};

export function buildUserMessage(d) {
  const sim = (v) => (v ? "sim" : "não");
  return `Analise o perfil abaixo e gere o diagnóstico completo.

## Posicionamento
- Nome: ${d.nome || "(não informado)"}
- Área: ${d.area || "(não informada)"}
- Senioridade: ${d.senioridade || "(não informada)"}
- Cargo/posicionamento-alvo: ${d.objetivo || "(não informado)"}
- Mercado-alvo: ${d.mercado || "Brasil"}
- Momento: ${d.momento || "(não informado)"}

## Perfil atual
### Headline atual
${d.headline || "(vazia ou não informada)"}

### Sobre atual
${d.sobre || "(vazio ou não informado)"}

### Experiências (como estão hoje)
${d.experiencias || "(não informadas)"}

### Competências atuais
${d.competencias || "(não informadas)"}

## Configuração atual
- Foto profissional: ${sim(d.tem_foto)}
- Banner personalizado: ${sim(d.tem_banner)}
- URL personalizada: ${sim(d.tem_url)}
- Recomendações recebidas: ${sim(d.tem_recomendacoes)}
- Destaques (Featured) configurados: ${sim(d.tem_destaques)}
- Frequência de publicação: ${d.frequencia_publicacao || "não publica"}
- Tamanho da rede: ${d.tamanho_rede || "(não informado)"}

## Contexto adicional do aluno
${d.contexto || "(nenhum)"}`;
}
