"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { ChevronRight, ChevronLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const TEMPLATES = [
  {
    id: "minimal",
    name: "Minimalista",
    description: "Espaçoso, elegante, tipografia como destaque",
    photoStyle: "Circular, lado direito",
    preview: {
      bg: "bg-white",
      accent: "bg-zinc-900",
      layout: "split",
    },
  },
  {
    id: "editorial",
    name: "Editorial Bold",
    description: "Foto full-bleed com gradiente, alto contraste",
    photoStyle: "Fundo completo do hero",
    preview: {
      bg: "bg-zinc-900",
      accent: "bg-white",
      layout: "fullbleed",
    },
  },
  {
    id: "corporate",
    name: "Clean Corporate",
    description: "Organizado, formal, avatar discreto no topo",
    photoStyle: "Avatar pequeno ao lado do nome",
    preview: {
      bg: "bg-zinc-50",
      accent: "bg-zinc-700",
      layout: "centered",
    },
  },
  {
    id: "asymmetric",
    name: "Assimétrico",
    description: "Moderno, editorial sem ser ousado",
    photoStyle: "Vertical no terço esquerdo",
    preview: {
      bg: "bg-white",
      accent: "bg-zinc-800",
      layout: "asymmetric",
    },
  },
  {
    id: "geometric",
    name: "Geométrico",
    description: "Visual diferenciado e memorável",
    photoStyle: "Hexágono centralizado à direita",
    preview: {
      bg: "bg-zinc-100",
      accent: "bg-zinc-900",
      layout: "geometric",
    },
  },
]

function TemplatePreview({ template, selected }: { template: typeof TEMPLATES[0]; selected: boolean }) {
  const { bg, accent, layout } = template.preview

  return (
    <div
      className={cn(
        "relative h-36 w-full overflow-hidden rounded-lg border-2 transition-all",
        selected ? "border-zinc-900" : "border-zinc-200"
      )}
    >
      <div className={cn("h-full w-full", bg)}>
        {layout === "split" && (
          <div className="flex h-full">
            <div className="flex flex-1 flex-col justify-center px-4 gap-1.5">
              <div className="h-2 w-16 rounded bg-zinc-900 opacity-80" />
              <div className="h-1.5 w-24 rounded bg-zinc-400 opacity-60" />
              <div className="mt-1 h-1 w-12 rounded bg-zinc-300" />
            </div>
            <div className="flex w-24 items-center justify-center">
              <div className={cn("h-16 w-16 rounded-full border-2 border-white", accent, "opacity-90")} />
            </div>
          </div>
        )}
        {layout === "fullbleed" && (
          <div className="relative h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/60 to-transparent" />
            <div className="absolute right-0 top-0 h-full w-1/2 bg-zinc-600 opacity-40" />
            <div className="relative flex h-full flex-col justify-center px-4 gap-1.5">
              <div className="h-2 w-16 rounded bg-white opacity-90" />
              <div className="h-1.5 w-24 rounded bg-zinc-300 opacity-70" />
            </div>
          </div>
        )}
        {layout === "centered" && (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <div className="h-10 w-10 rounded-full border-2 border-zinc-300 bg-zinc-200" />
            <div className="h-2 w-16 rounded bg-zinc-700 opacity-80" />
            <div className="h-1.5 w-20 rounded bg-zinc-400 opacity-50" />
          </div>
        )}
        {layout === "asymmetric" && (
          <div className="flex h-full">
            <div className="w-1/3 bg-zinc-800 opacity-70" />
            <div className="flex flex-1 flex-col justify-center px-4 gap-1.5">
              <div className="h-2 w-16 rounded bg-zinc-900 opacity-80" />
              <div className="h-1.5 w-20 rounded bg-zinc-400 opacity-60" />
            </div>
          </div>
        )}
        {layout === "geometric" && (
          <div className="flex h-full items-center">
            <div className="flex flex-1 flex-col justify-center px-4 gap-1.5">
              <div className="h-2 w-16 rounded bg-zinc-900 opacity-80" />
              <div className="h-1.5 w-20 rounded bg-zinc-400 opacity-60" />
            </div>
            <div className="mr-4 flex items-center justify-center">
              <div
                className={cn("h-16 w-16", accent, "opacity-85")}
                style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
              />
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white">
          <Check className="h-3 w-3" />
        </div>
      )}
    </div>
  )
}

export default function TemplatePage() {
  const router = useRouter()
  const supabase = createClient()

  const [selected, setSelected] = useState("minimal")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)

    await supabase
      .from("portfolios")
      .update({ template_id: selected })
      .eq("status", "draft")

    router.push("/wizard/domain")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Template</h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          Escolha o layout do seu portfólio. Todos aplicam automaticamente seu
          brandbook (cores, fontes e logo).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => setSelected(template.id)}
            className="group text-left"
          >
            <TemplatePreview template={template} selected={selected === template.id} />
            <div className="mt-2.5 space-y-0.5 px-0.5">
              <p className={cn(
                "text-sm font-semibold",
                selected === template.id ? "text-zinc-900" : "text-zinc-700"
              )}>
                {template.name}
              </p>
              <p className="text-xs text-zinc-500">{template.description}</p>
              <p className="text-xs text-zinc-400">Foto: {template.photoStyle}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={() => router.push("/wizard/content")}>
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={handleSave} loading={saving} size="lg">
          Continuar
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
