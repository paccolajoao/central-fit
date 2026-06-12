"use client";

import { useState, useRef } from "react";
import { UploadCloudIcon, CheckCircle2Icon, XCircleIcon, FileArchiveIcon, FileTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ImportResult } from "@/lib/activity-types";

type Props = {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
};

export function ImportSamsungDialog({ open, onClose, onImported }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function handleFile(f: File) {
    setFile(f);
    setResult(null);
    setError(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post<ImportResult>("/api/activities/import/samsung", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      toast.success(`${res.data.imported} atividades importadas!`);
      onImported();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Erro ao importar. Verifique o arquivo e tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setFile(null);
    setResult(null);
    setError(null);
    onClose();
  }

  function formatDate(d: string) {
    return new Date(d + "T12:00:00").toLocaleDateString("pt-BR");
  }

  const isZip = file?.name.toLowerCase().endsWith(".zip");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative bg-card border rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold">Importar do Samsung Health</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Faça upload do arquivo exportado do Samsung Health (ZIP ou CSV de exercícios).
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-sm text-muted-foreground">
          <p className="font-medium text-foreground text-xs uppercase tracking-wide">Como exportar</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Abra o <strong>Samsung Health</strong> no celular</li>
            <li>Toque no perfil → <strong>Configurações</strong></li>
            <li>Vá em <strong>Gerenciar dados</strong> → <strong>Baixar dados pessoais</strong></li>
            <li>Selecione <strong>Health data</strong> e faça o download do ZIP</li>
            <li>Faça upload do arquivo ZIP aqui embaixo</li>
          </ol>
        </div>

        {/* Drop zone */}
        {!result && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
              dragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".zip,.csv,text/csv,application/zip"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                {isZip
                  ? <FileArchiveIcon className="size-5 text-primary" />
                  : <FileTextIcon className="size-5 text-primary" />
                }
                <span className="text-sm font-medium">{file.name}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloudIcon className="size-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Arraste o ZIP aqui ou{" "}
                  <span className="text-primary font-medium">clique para selecionar</span>
                </p>
                <p className="text-xs text-muted-foreground">ZIP (dados completos) ou CSV de exercícios</p>
              </div>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="size-5 text-green-600 dark:text-green-400" />
              <p className="font-medium text-green-800 dark:text-green-300">Importação concluída!</p>
            </div>
            <p className="text-sm text-green-700 dark:text-green-400 ml-7">
              <strong>{result.imported}</strong> atividades importadas
              {result.skipped > 0 && `, ${result.skipped} duplicadas ignoradas`}.
            </p>
            {result.date_range && (
              <p className="text-xs text-green-600 dark:text-green-500 ml-7">
                Período: {formatDate(result.date_range.from)} → {formatDate(result.date_range.to)}
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-2">
            <XCircleIcon className="size-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleClose}>
            {result ? "Fechar" : "Cancelar"}
          </Button>
          {!result && (
            <Button onClick={handleImport} disabled={!file || loading}>
              {loading ? "Importando..." : "Importar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
