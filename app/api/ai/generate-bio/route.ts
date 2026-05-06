import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type ContentBlock = Anthropic.TextBlockParam | Anthropic.DocumentBlockParam

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("cv") as File | null
  const brandbookData = formData.get("brandbook") as string | null

  let brandbook: {
    slogan?: string
    voice_tone?: string
    market_sector?: string
  } = {}

  if (brandbookData) {
    try {
      brandbook = JSON.parse(brandbookData)
    } catch {}
  }

  const voiceTone = brandbook.voice_tone ?? "profissional"
  const sector = brandbook.market_sector ?? ""
  const slogan = brandbook.slogan ?? ""

  const contentBlocks: ContentBlock[] = []

  const systemPrompt = `Você é um especialista em posicionamento de carreira e escrita de bios profissionais para portfólios digitais.

Tom de voz a usar: ${voiceTone}
${sector ? `Setor de atuação: ${sector}` : ""}
${slogan ? `Slogan/posicionamento: "${slogan}"` : ""}

Gere 3 versões diferentes de bio profissional para a seção "Sobre mim" de um portfólio digital. Cada bio deve ter entre 3 e 5 frases, ser escrita em primeira pessoa, e transmitir o tom de voz especificado.

RETORNE APENAS JSON VÁLIDO:
{
  "versions": [
    "Bio versão 1...",
    "Bio versão 2...",
    "Bio versão 3..."
  ]
}

Regras:
- Primeira pessoa (eu, minha, meu)
- Sem clichês como "apaixonado por" ou "profissional dedicado"
- Foco em impacto, resultados e posicionamento claro
- Linguagem natural e autêntica
- 3 a 5 frases por versão`

  if (file) {
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")

    contentBlocks.push({
      type: "text",
      text: "Analise o currículo abaixo e gere as bios profissionais conforme instruído.",
    })

    if (file.type === "application/pdf") {
      contentBlocks.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: base64,
        },
      } as Anthropic.DocumentBlockParam)
    } else {
      // DOCX/text fallback — treat as text
      const text = Buffer.from(buffer).toString("utf-8")
      contentBlocks.push({
        type: "text",
        text: `CURRÍCULO:\n${text}`,
      })
    }
  } else {
    contentBlocks.push({
      type: "text",
      text: "Não há currículo disponível. Gere as bios com base apenas no brandbook e posicionamento fornecidos.",
    })
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: contentBlocks }],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""

  let parsed
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(jsonMatch?.[0] ?? text)
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response", raw: text },
      { status: 500 }
    )
  }

  return NextResponse.json(parsed)
}
