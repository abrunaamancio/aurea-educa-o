import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type ContentBlock = Anthropic.TextBlockParam | Anthropic.ImageBlockParam | Anthropic.DocumentBlockParam

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await request.formData()
  const files = formData.getAll("files") as File[]

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 })
  }

  const fileContents = await Promise.all(
    files.slice(0, 3).map(async (file) => {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString("base64")
      const isPdf = file.type === "application/pdf"
      return { base64, isPdf, mediaType: file.type, name: file.name }
    })
  )

  const contentBlocks: ContentBlock[] = []

  contentBlocks.push({
    type: "text",
    text: `Você é um especialista em design e identidade visual. Analise o(s) arquivo(s) de brandbook abaixo e extraia as seguintes informações no formato JSON especificado.

RETORNE APENAS JSON VÁLIDO, sem texto antes ou depois, no seguinte formato:
{
  "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "fonts": ["NomeFonte1", "NomeFonte2"],
  "slogan": "Frase de posicionamento identificada ou sugerida",
  "voice_tone": "Tom de voz identificado (ex: profissional, acolhedor, disruptivo, criativo)",
  "market_sector": "Setor de mercado identificado (ex: tecnologia, saúde, educação, marketing)",
  "has_logo": true
}

Regras:
- colors: extraia no máximo 5 cores principais (excluindo #000000 e #ffffff). Se não encontrar, sugira com base no estilo visual
- fonts: extraia no máximo 3 fontes. Se não identificar, retorne array vazio
- slogan: se não encontrar um slogan explícito, sugira baseado no posicionamento do material
- voice_tone: uma das opções: "profissional", "acolhedor", "disruptivo", "criativo", "técnico", "inspiracional"
- market_sector: setor ou área de atuação`,
  })

  for (const file of fileContents) {
    if (file.isPdf) {
      contentBlocks.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: file.base64,
        },
      } as Anthropic.DocumentBlockParam)
    } else {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const
      type ValidImageType = typeof validImageTypes[number]
      const mediaType: ValidImageType = validImageTypes.includes(file.mediaType as ValidImageType)
        ? (file.mediaType as ValidImageType)
        : "image/jpeg"

      contentBlocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data: file.base64,
        },
      })
    }
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
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
