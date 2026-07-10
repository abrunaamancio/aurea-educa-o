"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { ChevronRight, ChevronLeft, Search, Check, X, Loader2, ExternalLink } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface DomainResult {
  domain: string
  available: boolean
  price_cents: number
  currency: string
}

export default function DomainPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState("")
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<DomainResult[]>([])
  const [selected, setSelected] = useState<DomainResult | null>(null)
  const [useOwn, setUseOwn] = useState(false)
  const [ownDomain, setOwnDomain] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSearch() {
    if (!name.trim()) return
    setSearching(true)
    setResults([])
    setSelected(null)

    const res = await fetch(
      `/api/domain/search?name=${encodeURIComponent(name.trim())}`
    )
    if (res.ok) {
      const data = await res.json()
      setResults(data.suggestions ?? [])
    }
    setSearching(false)
  }

  async function handleSave() {
    setSaving(true)
    const domain = useOwn ? ownDomain.trim() : selected?.domain

    if (!domain) {
      setSaving(false)
      return
    }

    await supabase
      .from("portfolios")
      .update({ domain })
      .eq("status", "draft")

    router.push("/wizard/preview")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Domínio</h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          Seu portfólio precisa de um endereço na internet. O domínio será
          registrado no <strong>seu nome</strong> e ficará com você para sempre.
        </p>
      </div>

      {/* Cost notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
        <p className="text-sm font-medium text-amber-900">
          Custo de domínio
        </p>
        <p className="mt-1 text-sm text-amber-800">
          Registrar um domínio <code className="text-xs">.com</code> custa
          aproximadamente <strong>R$&nbsp;45–85/ano</strong>. O valor exato
          aparece antes de qualquer cobrança. Você renova anualmente de forma
          independente — sem depender da Aurea Educação.
        </p>
      </div>

      {/* Search */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Buscar domínio
        </h2>
        <p className="text-sm text-zinc-500">
          Digite seu nome completo para sugerirmos os melhores domínios (sempre
          com seu nome, nunca palavras genéricas).
        </p>

        <div className="flex gap-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ana Lima"
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} loading={searching}>
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </div>

        {results.length > 0 && (
          <ul className="space-y-2">
            {results.map((r) => (
              <li
                key={r.domain}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all ${
                  !r.available
                    ? "cursor-not-allowed border-zinc-100 bg-zinc-50 opacity-60"
                    : selected?.domain === r.domain
                    ? "cursor-pointer border-zinc-900 bg-zinc-50"
                    : "cursor-pointer border-zinc-200 hover:border-zinc-300"
                }`}
                onClick={() => r.available && setSelected(r)}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                    r.available
                      ? selected?.domain === r.domain
                        ? "bg-zinc-900 text-white"
                        : "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {r.available ? (
                    selected?.domain === r.domain ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </span>

                <span className="flex-1 font-mono text-sm text-zinc-800">
                  {r.domain}
                </span>

                <div className="text-right">
                  {r.available ? (
                    <>
                      <p className="text-sm font-semibold text-zinc-900">
                        {formatCurrency(r.price_cents)}
                        <span className="text-xs font-normal text-zinc-400">/ano</span>
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-zinc-400">Indisponível</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {selected && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-sm font-medium text-green-900">
              Domínio selecionado:{" "}
              <span className="font-mono">{selected.domain}</span>
            </p>
            <p className="mt-0.5 text-sm text-green-800">
              {formatCurrency(selected.price_cents)}/ano — renovação anual
              independente.
              <br />
              O checkout será concluído após a publicação.
            </p>
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200" />
        </div>
        <div className="relative flex justify-center text-xs text-zinc-500">
          <span className="bg-zinc-50 px-3">ou</span>
        </div>
      </div>

      {/* Own domain */}
      <section className="space-y-3">
        <button
          type="button"
          onClick={() => setUseOwn(!useOwn)}
          className="flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-900"
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded border ${
              useOwn ? "border-zinc-900 bg-zinc-900" : "border-zinc-300"
            }`}
          >
            {useOwn && <Check className="h-2.5 w-2.5 text-white" />}
          </span>
          Já tenho um domínio
        </button>

        {useOwn && (
          <div className="space-y-2">
            <Input
              value={ownDomain}
              onChange={(e) => setOwnDomain(e.target.value)}
              placeholder="seunome.com"
              hint="Informe o domínio que você já possui. Orientaremos a configuração do DNS."
            />
            <a
              href="https://vercel.com/docs/projects/domains/add-a-domain"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-zinc-500 underline-offset-2 hover:underline"
            >
              Ver instruções de configuração DNS
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </section>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={() => router.push("/wizard/template")}>
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={!selected && !(useOwn && ownDomain.trim())}
          size="lg"
        >
          Continuar
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
