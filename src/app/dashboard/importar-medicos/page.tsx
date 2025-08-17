"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Papa, { ParseResult } from "papaparse";
import AccessDenied from "@/components/ui/AccessDenied";
import { authClient } from "@/lib/auth-client";
import { Prisma } from "../../../../generated/prisma";

// 👉 Tipo para um médico importado
interface Medico {
  cpf: string;
  crm: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  especialidade: string;
  setor: string[];
}

// 👉 Tipo para resultados da importação
interface ImportResults {
  success: number;
  duplicates: number;
  errors: { medico: string; erro: string }[];
}

export default function ImportarMedicos() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<Medico[]>([]);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const [error, setError] = useState("");
  const [user, setUser] = useState<Prisma.UserCreateInput>(
    {} as Prisma.UserCreateInput
  );
  const { data: session, isPending: loadingUser } = authClient.useSession();

  useEffect(() => {
    if (!loadingUser) setUser(session?.user || ({} as Prisma.UserCreateInput));
  }, [loadingUser, session?.user]);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (
      selectedFile &&
      (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv"))
    ) {
      setFile(selectedFile);
      setError("");
      setExtractedData([]);
      setImportResults(null);
    } else {
      setError("Por favor, selecione apenas arquivos CSV (.csv).");
    }
  };

  const processFile = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    setExtractedData([]);

    try {
      const fileText = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
        reader.readAsText(file);
      });

      setUploading(false);
      setExtracting(true);

      const { data, errors }: ParseResult<Record<string, string>> = Papa.parse(
        fileText,
        {
          header: true,
          skipEmptyLines: true,
        }
      );

      if (errors.length) throw new Error("Erro ao interpretar CSV");

      const processedData: Medico[] = data
        .map((item) => ({
          cpf: String(item.cpf || "").trim(),
          crm: String(item.crm || "").trim(),
          nomeCompleto: String(item.nomeCompleto || "").trim(),
          email: String(item.email || "").trim(),
          telefone: String(item.telefone || "").trim(),
          especialidade: String(item.especialidade || "").trim(),
          setor: item.setor
            ? item.setor
                .split(";")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        }))
        .filter((item) => item.cpf && item.nomeCompleto && item.email);

      if (processedData.length > 0) setExtractedData(processedData);
      else
        setError(
          "Nenhum registro válido encontrado. Verifique as colunas: cpf, nomeCompleto, email"
        );
    } catch (err) {
      if (err instanceof Error) {
        setError("Erro ao processar arquivo: " + err.message);
      } else {
        setError("Erro desconhecido ao processar arquivo");
      }
    } finally {
      setUploading(false);
      setExtracting(false);
    }
  };

  const importarMedicos = async () => {
    if (extractedData.length === 0) return;
    setImporting(true);
    setProgress(0);

    const results: ImportResults = { success: 0, errors: [], duplicates: 0 };

    for (let i = 0; i < extractedData.length; i++) {
      const medicoData = extractedData[i];
      setProgress(((i + 1) / extractedData.length) * 100);

      try {
        const res = await fetch(
          `/api/medico/${medicoData.cpf.replace(/\D/g, "")}`
        );
        const data = await res.json();

        if (data.id) {
          results.duplicates++;
          continue;
        }

        const result = await fetch("/api/medico", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(medicoData),
        });

        if (!result.ok) {
          const errorData = await result.json();
          throw new Error(errorData.error || "Erro ao importar médico");
        }

        results.success++;
      } catch (error) {
        results.errors.push({
          medico: medicoData.nomeCompleto,
          erro: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    setImportResults(results);
    setImporting(false);
  };

  const downloadTemplate = () => {
    const csvContent = `cpf,crm,nomeCompleto,email,telefone,especialidade,setor\n11122233344,12345/SP,Dr. Exemplo da Silva,exemplo@email.com,(11) 98877-6655,Cardiologia,"UTI;Emergência"`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "template_medicos.csv";
    link.click();
  };

  if (loadingUser)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );

  if (!user || user.role !== "admin") return <AccessDenied />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Upload className="w-8 h-8 text-blue-600" />
          Importar Médicos
        </h1>
        <Card className="my-6">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Baixe o Template CSV
              </h3>
              <p className="text-sm text-gray-600">
                Use este modelo para importar corretamente
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Baixar Template
            </Button>
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Selecionar Arquivo CSV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button
                onClick={() => document.getElementById("file-upload").click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Escolher Arquivo
              </Button>
              {file && (
                <div className="mt-4">
                  <p>Arquivo: {file.name}</p>
                  <Button
                    onClick={processFile}
                    disabled={uploading || extracting}
                    className="mt-2"
                  >
                    {uploading
                      ? "Enviando..."
                      : extracting
                      ? "Processando..."
                      : "Processar"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {extractedData.length > 0 && !importResults && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>2. Pré-visualização e Confirmação</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{extractedData.length} médicos prontos para importar.</p>
              {importing && <Progress value={progress} className="my-2" />}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CPF</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractedData.slice(0, 10).map((m, i) => (
                    <TableRow key={i}>
                      <TableCell>{m.cpf}</TableCell>
                      <TableCell>{m.nomeCompleto}</TableCell>
                      <TableCell>{m.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                onClick={importarMedicos}
                disabled={importing}
                className="mt-4"
              >
                {importing ? "Importando..." : "Confirmar Importação"}
              </Button>
            </CardContent>
          </Card>
        )}
        {importResults && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado da Importação</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{importResults.success} importados com sucesso.</p>
              <p>{importResults.duplicates} duplicados (ignorados).</p>
              <p>{importResults.errors.length} erros.</p>
              <Button
                onClick={() => {
                  setFile(null);
                  setExtractedData([]);
                  setImportResults(null);
                }}
                className="mt-4"
              >
                Importar Novo Arquivo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
