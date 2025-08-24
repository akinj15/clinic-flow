"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileBarChart, Download, Filter } from "lucide-react";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import AccessDenied from "@/components/ui/AccessDenied";
import { authClient } from "@/lib/auth-client";
import { Feedback, Medico, Prisma, Setor, TipoAbordagem, Unidade } from "@generated/prisma";

type FeedbackWithMedico = Feedback & { medico: Medico | null };

export default function RelatorioFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<FeedbackWithMedico[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [abordagem, setAbordagem] = useState<TipoAbordagem[]>([]);
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    medicoId: "",
    setor: "",
    tipoAbordagem: "",
  });
  const [user, setUser] = useState<Prisma.UserCreateInput>(
    {} as Prisma.UserCreateInput
  );
  const { data: session, isPending: loadingUser } = authClient.useSession();

  const carregarUnidades = async () => {
    const res = await fetch("/api/unidade", { cache: "no-store" });
    if (!res.ok) throw new Error("Erro ao listar unidades");
    const data: Unidade[] = await res.json();
    setUnidades(data);
  };

  const carregarAbordagem = async () => {
    const res = await fetch("/api/tipo-abordagem", { cache: "no-store" });
    if (!res.ok) throw new Error("Erro ao listar abordagem");
    const data: TipoAbordagem[] = await res.json();
    setAbordagem(data);
  };
  

  const carregarSetores = async () => {
    const res = await fetch("/api/setor", { cache: "no-store" });
    if (!res.ok) throw new Error("Erro ao listar setores");
    const data: Setor[] = await res.json();
    setSetores(data);
  };
  
  const carregarMedicos = async () => {
    let res = await fetch("/api/medico", { cache: "no-store" });
    if (!res.ok) throw new Error("Erro ao listar medicos");
    const dataMed: Medico[] = await res.json();
    setMedicos(dataMed);
  };

  const consultarFeedbacks = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filtros).toString();
      const res = await fetch(`/api/feedback?${query}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Erro ao listar feedbacks");
      setFeedbacks(await res.json());
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingUser) setUser(session?.user || ({} as Prisma.UserCreateInput));
    if (!loadingUser && !session?.user) {
      setLoading(false);
      return;
    }
    carregarUnidades();
    carregarAbordagem();
    carregarSetores();
    carregarMedicos();
    setLoading(false);
  }, [loadingUser]);

  const handleFiltroChange = (campo: string, valor: string) =>
    setFiltros((prev) => ({ ...prev, [campo]: valor }));

  
  const removerAcentos = (str: string | undefined) =>
    str
  ? str
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
          .replace(/[çÇ]/g, (c: string) => (c === "ç" ? "c" : "C"))
      : "";

  const exportarCSV = () => {
    const headers = [
      "Data",
      "CPF",
      "CRM",
      "Nome do Medico",
      "Email",
      "Telefone",
      "Especialidade",
      "Setor",
      "Estado",
      "Unidade",
      "Tipo de Abordagem",
      "Detalhes",
    ];
    const csvData = feedbacks.map((f) => [
      format(parseISO(f.createdAt.toString()), "dd/MM/yyyy HH:mm"),
      removerAcentos(f.medico?.cpf),
      removerAcentos(f.medico?.crm),
      removerAcentos(f.medico?.nomeCompleto),
      removerAcentos(f.medico?.email),
      removerAcentos(f.medico?.telefone),
      removerAcentos(f.medico?.especialidade),
      removerAcentos(f.setor),
      removerAcentos(f.estado),
      removerAcentos(f.unidade),
      removerAcentos(f.tipoAbordagem),
      removerAcentos(f.detalhes || ""),
    ]);
    const csvContent = [
      headers.join(";"),
      ...csvData.map((row) => row.map((field) => `"${field}"`).join(";")),
    ].join("\n");
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_feedbacks_${format(
      new Date(),
      "yyyy-MM-dd"
    )}.csv`;
    link.click();
  };


  if (loadingUser || loading)
    return (
      <div className="min-h-screen p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  if (!user || user.role !== "admin") return <AccessDenied />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <FileBarChart className="w-8 h-8 text-blue-600" />
          Relatório de Feedbacks
        </h1>
        <Card className="my-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Data Início
                </label>
                <Input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) =>
                    handleFiltroChange("dataInicio", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Data Fim
                </label>
                <Input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) =>
                    handleFiltroChange("dataFim", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Médico</label>
                <Select
                  value={filtros.medicoId}
                  onValueChange={(v) => handleFiltroChange("medicoId", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value={"TODOS"}>Todos</SelectItem> */}
                    {medicos.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.nomeCompleto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Setor</label>
                <Select
                  value={filtros.setor}
                  onValueChange={(v) => handleFiltroChange("setor", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value={"TODOS"}>Todos</SelectItem> */}
                    {setores.map((s) => (
                      <SelectItem key={s.id} value={s.nome}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Abordagem
                </label>
                <Select
                  value={filtros.tipoAbordagem}
                  onValueChange={(v) => handleFiltroChange("tipoAbordagem", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value={""}>Todos</SelectItem> */}
                    {abordagem.map((t) => (
                      <SelectItem key={t.id} value={t.nome}>
                        {t.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                Mostrando {feedbacks.length} de {feedbacks.length}{" "}
                feedbacks
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  onClick={exportarCSV}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button onClick={consultarFeedbacks}>Consultar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead>Data</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>CRM</TableHead>
                    <TableHead>Nome do Médico</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Abordagem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((f) => (
                    <TableRow key={f.id} className="hover:bg-blue-50/50">
                      <TableCell>
                        {format(
                          parseISO(f.createdAt.toString()),
                          "dd/MM/yy HH:mm"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{f.medico?.cpf}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{f.medico?.crm}</Badge>
                      </TableCell>
                      <TableCell>{f.medico?.nomeCompleto}</TableCell>
                      <TableCell>{f.medico?.email}</TableCell>
                      <TableCell>
                        <Badge>{f.setor}</Badge>
                      </TableCell>
                      <TableCell>
                        {f.unidade}, {f.estado}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            f.tipoAbordagem === "ELOGIO/RECONHECIMENTO"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {f.tipoAbordagem}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
