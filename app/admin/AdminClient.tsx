"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Plus, RotateCcw, Ban, Globe, Upload } from "lucide-react"

interface Student {
  id: string
  email: string
  ciclo: string
  access_starts_at: string
  access_expires_at: string
  status: "active" | "expired" | "revoked"
  created_at: string
  first_login_at: string | null
}

interface Portfolio {
  user_id: string
  status: string
  domain: string | null
}

interface AdminClientProps {
  students: Student[]
  portfolios: Portfolio[]
}

const STATUS_COLORS = {
  active: "bg-green-100 text-green-700",
  expired: "bg-amber-100 text-amber-700",
  revoked: "bg-red-100 text-red-600",
}

const STATUS_LABELS = {
  active: "Ativo",
  expired: "Expirado",
  revoked: "Revogado",
}

export function AdminClient({ students: initialStudents }: AdminClientProps) {
  const supabase = createClient()
  const [students, setStudents] = useState<Student[]>(initialStudents)

  // Add student form
  const [newEmail, setNewEmail] = useState("")
  const [newCiclo, setNewCiclo] = useState("")
  const [newStart, setNewStart] = useState(new Date().toISOString().split("T")[0])
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState("")

  // CSV bulk
  const [csvProcessing, setCsvProcessing] = useState(false)

  // Filter
  const [cicloFilter, setCicloFilter] = useState("")

  const ciclos = [...new Set(students.map((s) => s.ciclo))].sort()

  async function handleAdd() {
    setAdding(true)
    setAddError("")

    const { data, error } = await supabase
      .from("approved_students")
      .insert({
        email: newEmail.trim().toLowerCase(),
        ciclo: newCiclo.trim(),
        access_starts_at: new Date(newStart).toISOString(),
        status: "active",
      })
      .select()
      .single()

    if (error) {
      setAddError(error.message)
    } else if (data) {
      setStudents([data as Student, ...students])
      setNewEmail("")
    }

    setAdding(false)
  }

  async function handleRevoke(id: string) {
    await supabase
      .from("approved_students")
      .update({ status: "revoked" })
      .eq("id", id)
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "revoked" } : s))
    )
  }

  async function handleRenew(id: string) {
    const newStart = new Date().toISOString()
    await supabase
      .from("approved_students")
      .update({ status: "active", access_starts_at: newStart })
      .eq("id", id)
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "active",
              access_starts_at: newStart,
              access_expires_at: new Date(
                Date.now() + 6 * 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
            }
          : s
      )
    )
  }

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvProcessing(true)

    const text = await file.text()
    const lines = text.trim().split("\n").slice(1)

    for (const line of lines) {
      const [email, ciclo, start] = line.split(",").map((s) => s.trim())
      if (!email || !ciclo) continue

      await supabase.from("approved_students").upsert({
        email: email.toLowerCase(),
        ciclo,
        access_starts_at: start
          ? new Date(start).toISOString()
          : new Date().toISOString(),
        status: "active",
      })
    }

    const { data } = await supabase
      .from("approved_students")
      .select("*")
      .order("created_at", { ascending: false })
    setStudents(data ?? [])
    setCsvProcessing(false)
  }

  const filtered = cicloFilter
    ? students.filter((s) => s.ciclo === cicloFilter)
    : students

  const now = new Date()

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <h1 className="text-base font-semibold text-zinc-900">
          Painel da professora
        </h1>
        <p className="text-xs text-zinc-500">
          {students.length} aluno{students.length !== 1 ? "s" : ""} cadastrado{students.length !== 1 ? "s" : ""}
        </p>
      </header>

      <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        {/* Add student */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-zinc-900">Adicionar aluno</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <Input
              placeholder="email@exemplo.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              error={addError}
            />
            <Input
              placeholder="Ciclo (ex: Ciclo 1 — 2026)"
              value={newCiclo}
              onChange={(e) => setNewCiclo(e.target.value)}
            />
            <Input
              type="date"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
            />
            <Button onClick={handleAdd} loading={adding} disabled={!newEmail || !newCiclo}>
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">
              <Upload className="h-4 w-4" />
              {csvProcessing ? "Processando..." : "Importar CSV"}
              <input
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={handleCsvUpload}
                disabled={csvProcessing}
              />
            </label>
            <p className="text-xs text-zinc-400">
              Colunas: email, ciclo, data_inicio (YYYY-MM-DD)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={cicloFilter}
            onChange={(e) => setCicloFilter(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none"
          >
            <option value="">Todos os ciclos</option>
            {ciclos.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="text-sm text-zinc-500">
            {filtered.length} aluno{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Students table */}
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Aluno
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Ciclo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Acesso
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Portfólio
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((student) => {
                const expires = new Date(student.access_expires_at)
                const isExpired = now > expires
                const daysLeft = Math.max(
                  0,
                  Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                )

                return (
                  <tr key={student.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-zinc-900">{student.email}</p>
                        {student.first_login_at ? (
                          <p className="text-xs text-zinc-400">
                            Primeiro acesso:{" "}
                            {new Date(student.first_login_at).toLocaleDateString("pt-BR")}
                          </p>
                        ) : (
                          <p className="text-xs text-zinc-400 italic">Nunca acessou</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{student.ciclo}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-zinc-500">
                        <p>
                          Inicia:{" "}
                          {new Date(student.access_starts_at).toLocaleDateString("pt-BR")}
                        </p>
                        <p className={isExpired ? "text-red-500" : ""}>
                          Expira:{" "}
                          {expires.toLocaleDateString("pt-BR")}
                          {!isExpired && student.status === "active" && (
                            <span className="ml-1 text-zinc-400">
                              ({daysLeft}d restantes)
                            </span>
                          )}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          STATUS_COLORS[student.status]
                        )}
                      >
                        {STATUS_LABELS[student.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">—</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {student.status !== "revoked" && (
                          <button
                            type="button"
                            onClick={() => handleRevoke(student.id)}
                            className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                            title="Revogar acesso"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                        {(student.status === "expired" || student.status === "revoked") && (
                          <button
                            type="button"
                            onClick={() => handleRenew(student.id)}
                            className="rounded p-1 text-zinc-400 hover:bg-green-50 hover:text-green-600"
                            title="Renovar acesso (+6 meses)"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-400">
                    Nenhum aluno cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
