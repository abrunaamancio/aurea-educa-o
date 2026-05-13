"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileDropzoneProps {
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSizeMB?: number
  label?: string
  hint?: string
  onFilesChange: (files: File[]) => void
  files: File[]
}

export function FileDropzone({
  accept = {
    "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    "application/pdf": [".pdf"],
  },
  maxFiles = 3,
  maxSizeMB = 10,
  label = "Arraste seus arquivos aqui",
  hint,
  onFilesChange,
  files,
}: FileDropzoneProps) {
  const [error, setError] = useState("")

  const onDrop = useCallback(
    (accepted: File[]) => {
      setError("")
      const combined = [...files, ...accepted].slice(0, maxFiles)
      onFilesChange(combined)
    },
    [files, maxFiles, onFilesChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - files.length,
    maxSize: maxSizeMB * 1024 * 1024,
    onDropRejected: (rejections) => {
      const msg = rejections[0]?.errors[0]?.message ?? "Arquivo inválido"
      setError(msg)
    },
  })

  function remove(index: number) {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
          isDragActive
            ? "border-zinc-400 bg-zinc-50"
            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mb-3 h-8 w-8 text-zinc-400" />
        <p className="text-sm font-medium text-zinc-700">{label}</p>
        <p className="mt-1 text-xs text-zinc-400">
          {hint ?? `PDF ou imagem — até ${maxSizeMB}MB por arquivo`}
        </p>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2.5"
            >
              {file.type.startsWith("image/") ? (
                <ImageIcon className="h-4 w-4 shrink-0 text-zinc-500" />
              ) : (
                <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
              )}
              <span className="min-w-0 flex-1 truncate text-sm text-zinc-700">
                {file.name}
              </span>
              <span className="shrink-0 text-xs text-zinc-400">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="shrink-0 text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
