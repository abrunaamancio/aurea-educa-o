"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const STEPS = [
  { id: 1, label: "Conta", path: "/wizard" },
  { id: 2, label: "Brandbook", path: "/wizard/brandbook" },
  { id: 3, label: "Conteúdo", path: "/wizard/content" },
  { id: 4, label: "Template", path: "/wizard/template" },
  { id: 5, label: "Domínio", path: "/wizard/domain" },
  { id: 6, label: "Publicar", path: "/wizard/preview" },
]

function getStepNumber(pathname: string): number {
  const step = STEPS.find((s) => s.path === pathname)
  return step?.id ?? 1
}

export function WizardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const currentStep = getStepNumber(pathname)

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900">
            Aurea Educação
          </Link>
          <span className="text-sm text-zinc-500">
            Etapa {currentStep} de {STEPS.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-zinc-100">
          <div
            className="h-full bg-zinc-900 transition-all duration-500"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
        {/* Sidebar steps */}
        <aside className="hidden lg:block">
          <nav className="space-y-1">
            {STEPS.map((step) => {
              const status =
                step.id < currentStep
                  ? "completed"
                  : step.id === currentStep
                  ? "active"
                  : "pending"

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    status === "active" &&
                      "bg-zinc-900 text-white font-medium",
                    status === "completed" &&
                      "text-zinc-500 hover:bg-zinc-100 cursor-pointer",
                    status === "pending" && "text-zinc-400 cursor-not-allowed"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      status === "active" && "bg-white text-zinc-900",
                      status === "completed" && "bg-zinc-200 text-zinc-600",
                      status === "pending" && "bg-zinc-100 text-zinc-400"
                    )}
                  >
                    {status === "completed" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      step.id
                    )}
                  </span>
                  {step.label}
                </div>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
