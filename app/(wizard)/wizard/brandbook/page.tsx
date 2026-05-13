"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileDropzone } from "@/components/wizard/FileDropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Wand2, ChevronRight, RefreshCw } from "lucide-react"

const VOICE_TONES = [
  "profissional",
  "acolhedor",
  "disruptivo",
  "criativo",
  "técnico",
  "inspiracional",
]

interface ParsedBrandbook {
  colors: string[]
  fonts: string[]
  slogan: string
  voice_tone: string
  market_sector: string
}

export default function BrandbookPage() {
  const router = useRouter()
  const supabase = createClient()

  const [files, setFiles] = useState<File[]>([])
  const [parsing, setParsing] = useState(false)
  const [parsed, setParsed] = useState<ParsedBrandbook | null>(null)
  const [saving, setSaving] = useState(false)

  // Editable fields
  const [colors, setColors] = useState<string[]>(["#000000", "#ffffff"])
  const [fonts, setFonts] = useState<string[]>([""])
  const [slogan, setSlogan] = useState("")
  const [voiceTone, setVoiceTone] = useState("profissional")
  const [sector, setSector] = useState("")

  async function handleParse() {
    if (!files.length) return
    setParsing(true)

    const formData = new FormData()
    files.forEach((f) => formData.append("files", f))

    const res = await fetch("/api/ai/parse-brandbook", {
      method: "POST",
      body: formData,
    })

    if (res.ok) {
      const data: ParsedBrandbook = await res.json()
      setParsed(data)

      const allColors = [...(data.colors ?? []), "#000000", "#ffffff"]
      const uniqueColors = [...new Set(allColors)].slice(0, 7)
      setColors(uniqueColors)
      setFonts(data.fonts?.length ? data.fonts : [""])
      setSlogan(data.slogan ?? "")
      setVoiceTone(data.voice_tone ?? "profissional")
      setSector(data.market_sector ?? "")
    }

    setParsing(false)
  }

  async function handleSave() {
    setSaving(true)

    const { data: portfolio } = await supabase
      .from("portfolios")
      .select("id")
      .single()

    if (!portfolio) {
      setSaving(false)
      return
    }

    // Upload brandbook files to storage
    const fileUrls: string[] = []
    for (const file of files) {
      const ext = file.name.split(".").pop()
      const path = `${portfolio.id}/brandbook/${Date.now()}.${ext}`
      const { data } = await supabase.storage
        .from("portfolio-assets")
        .upload(path, file)
      if (data?.path) {
        const { data: url } = supabase.storage
          .from("portfolio-assets")
          .getPublicUrl(data.path)
        fileUrls.push(url.publicUrl)
      }
    }

    await supabase.from("brandbook").upsert({
      portfolio_id: portfolio.id,
      colors: colors.filter(Boolean),
      fonts: fonts.filter(Boolean),
      slogan,
      voice_tone: voiceTone,
      market_sector: sector,
      raw_files: fileUrls,
    })

    router.push("/wizard/content")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Brandbook</h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          Envie seu brandbook ou material de identidade visual. Nossa IA extrai
          automaticamente as cores, tipografias e posicionamento.
        </p>
      </div>

      {/* File upload */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Arquivos
        </h2>
        <FileDropzone
          files={files}
          onFilesChange={setFiles}
          label="Envie seu brandbook (PDF ou imagem)"
          hint="PDF do Canva, Figma, PNG ou JPG — até 10 MB por arquivo"
          maxFiles={3}
        />

        {files.length > 0 && (
          <Button
            onClick={handleParse}
            loading={parsing}
            className="gap-2"
          >
            <Wand2 className="h-4 w-4" />
            {parsed ? "Re-analisar com IA" : "Analisar com IA"}
          </Button>
        )}
      </section>

      {/* Brandbook fields — shown after parse or manually */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Identidade Visual
          </h2>
          {!parsed && (
            <span className="text-xs text-zinc-400">
              Preencha manualmente ou envie um arquivo para análise automática
            </span>
          )}
        </div>

        {/* Colors */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">
            Paleta de cores
          </label>
          <div className="flex flex-wrap gap-3">
            {colors.map((color, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const next = [...colors]
                    next[i] = e.target.value
                    setColors(next)
                  }}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-zinc-200 p-0.5"
                />
                <span className="text-[10px] font-mono text-zinc-400">
                  {color.toUpperCase()}
                </span>
              </div>
            ))}
            {colors.length < 7 && (
              <button
                type="button"
                onClick={() => setColors([...colors, "#cccccc"])}
                className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 text-zinc-400 hover:border-zinc-300"
              >
                +
              </button>
            )}
          </div>
          <p className="text-xs text-zinc-400">
            Selecione até 7 cores (preto e branco são sempre incluídos)
          </p>
        </div>

        {/* Fonts */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">
            Tipografias
          </label>
          <div className="space-y-2">
            {fonts.map((font, i) => (
              <Input
                key={i}
                value={font}
                onChange={(e) => {
                  const next = [...fonts]
                  next[i] = e.target.value
                  setFonts(next)
                }}
                placeholder={`Fonte ${i + 1} (ex: Inter, Playfair Display)`}
              />
            ))}
            {fonts.length < 3 && (
              <button
                type="button"
                onClick={() => setFonts([...fonts, ""])}
                className="text-sm text-zinc-500 underline-offset-2 hover:underline"
              >
                + Adicionar fonte
              </button>
            )}
          </div>
        </div>

        {/* Slogan */}
        <Input
          label="Slogan / Proposta de valor"
          value={slogan}
          onChange={(e) => setSlogan(e.target.value)}
          placeholder="Ex: Transformando dados em decisões estratégicas"
          hint="Frase que define seu posicionamento profissional"
        />

        {/* Voice tone */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">
            Tom de voz
          </label>
          <div className="flex flex-wrap gap-2">
            {VOICE_TONES.map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => setVoiceTone(tone)}
                className={`rounded-full px-3 py-1.5 text-sm capitalize transition-colors ${
                  voiceTone === tone
                    ? "bg-zinc-900 text-white"
                    : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300"
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        {/* Market sector */}
        <Input
          label="Mercado / Setor de atuação"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          placeholder="Ex: Tecnologia, Marketing Digital, Saúde"
          hint="Opcional — usado para personalizar a bio e o SEO do portfólio"
        />
      </section>

      {/* CTA */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} loading={saving} size="lg">
          Continuar
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
