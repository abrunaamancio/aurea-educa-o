import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, OUTPUT_SCHEMA, buildUserMessage } from "./_lib/prompt.js";

export const config = { maxDuration: 300 };

const client = new Anthropic();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST" });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({
      error: "ANTHROPIC_API_KEY não configurada. Adicione a variável de ambiente no painel da Vercel."
    });
    return;
  }

  const dados = req.body;
  if (!dados || (!dados.headline && !dados.sobre && !dados.experiencias)) {
    res.status(400).json({
      error: "Cole pelo menos uma parte do perfil (headline, sobre ou experiências) para a análise."
    });
    return;
  }

  try {
    const stream = client.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 32000,
      thinking: { type: "adaptive" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" }
        }
      ],
      output_config: {
        format: { type: "json_schema", schema: OUTPUT_SCHEMA }
      },
      messages: [{ role: "user", content: buildUserMessage(dados) }]
    });

    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      res.status(422).json({
        error: "A análise não pôde ser concluída para este conteúdo. Revise o texto colado e tente de novo."
      });
      return;
    }

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock) {
      res.status(502).json({ error: "Resposta vazia do modelo. Tente novamente." });
      return;
    }

    res.status(200).json(JSON.parse(textBlock.text));
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      res.status(500).json({ error: "Chave de API inválida. Verifique a ANTHROPIC_API_KEY." });
    } else if (err instanceof Anthropic.RateLimitError) {
      res.status(429).json({ error: "Muitas análises ao mesmo tempo. Aguarde um minuto e tente de novo." });
    } else if (err instanceof Anthropic.APIError) {
      res.status(502).json({ error: `Erro na análise (${err.status}). Tente novamente em instantes.` });
    } else {
      console.error(err);
      res.status(500).json({ error: "Erro inesperado. Tente novamente." });
    }
  }
}
