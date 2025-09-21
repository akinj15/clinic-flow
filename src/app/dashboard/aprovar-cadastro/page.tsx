"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Phone,
  Mail,
  FileText,
  Menu,
  Stethoscope,
  Building,
  FileBarChart,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";


export interface Medico {
  id: string;
  cpf: string;
  crm: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  especialidade: string;
  setor: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SolicitacoesAtualizacao {
  id: string;
  medicoId: string;
  medico: Medico;
  userId: string;
  user: User;
  cpf: string;
  crm: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  especialidade: string;
  setor: string[];
  solicitacao: any; // JSON field
  rejeitada: boolean;
  aprovada: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export default function ApprovalDashboard() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacoesAtualizacao[]>();
  const [selectedSolicitacao, setSelectedSolicitacao] =
    useState<SolicitacoesAtualizacao>();

  useEffect(() => {
    carregarSolicitacoes();
  }, []);

  const carregarSolicitacoes = async () => {
    // setLoading(true);
    try {
      const res = await fetch(`/api/solicitacao`);
      const data = await res.json();
      if (!data || data.error) {
        return;
      }
      console.log(data);
      setSolicitacoes(data);
      setSelectedSolicitacao(data[0]);
    } catch (error) {
      console.error("Erro ao carregar médicos:", error);
    } finally {
      // setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {

    if (selectedSolicitacao) {
      let res = await fetch("/api/solicitacao", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id,
          aprovada: true,
          rejeitada: false,
        }),
      });
      if (!res.ok) throw new Error("Erro ao aprovar solicitação");

      const s = selectedSolicitacao.solicitacao;
      res = await fetch(
        "/api/medico/" + selectedSolicitacao.cpf.replace(/\D/g, ""),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nomeCompleto: s.nomeCompleto,
            email: s.email,
            crm: s.crm,
            telefone: s.telefone,
            especialidade: s.especialidade,
          }),
        }
      );
      if (!res.ok) throw new Error("Erro ao aprovar solicitação");
      await carregarSolicitacoes();
    }
  };

  const handleReject = async (id: string) => {
    const res = await fetch("/api/solicitacao", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: id,
        aprovada: false,
        rejeitada: true,
      }),
    });
    if (!res.ok) throw new Error("Erro ao rejeitar solicitação");

    await carregarSolicitacoes();
  };

  const handleSolicitacaoSelect = (solicitacao: SolicitacoesAtualizacao) => {
    setSelectedSolicitacao(solicitacao);
  };

  const getStatusBadge = (solicitacao: SolicitacoesAtualizacao) => {
    if (solicitacao.aprovada) {
      return (
        <Badge
          variant="secondary"
          className="bg-success/20 text-success border-success/30"
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Aprovado
        </Badge>
      );
    }
    if (solicitacao.rejeitada) {
      return (
        <Badge
          variant="secondary"
          className="bg-destructive/20 text-destructive border-destructive/30"
        >
          <XCircle className="w-3 h-3 mr-1" />
          Rejeitado
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="bg-warning/20 text-warning border-warning/30"
      >
        <Clock className="w-3 h-3 mr-1" />
        Pendente
      </Badge>
    );
  };

  const getChanges = (solicitacao: SolicitacoesAtualizacao) => {
    const changes: Record<string, { old: any; new: any }> = {};
    const s = solicitacao.solicitacao;
    if (solicitacao.medico.nomeCompleto !== s.nomeCompleto) {
      changes.nomeCompleto = {
        old: solicitacao.medico.nomeCompleto,
        new: s.nomeCompleto,
      };
    }
    if (solicitacao.medico.email !== s.email) {
      changes.email = { old: solicitacao.medico.email, new: s.email };
    }
    if (solicitacao.medico.telefone !== s.telefone) {
      changes.telefone = {
        old: solicitacao.medico.telefone,
        new: s.telefone,
      };
    }
    if (solicitacao.medico.especialidade !== s.especialidade) {
      changes.especialidade = {
        old: solicitacao.medico.especialidade,
        new: s.especialidade,
      };
    }
    if (solicitacao.medico.crm !== s.crm) {
      changes.crm = { old: solicitacao.medico.crm, new: s.crm };
    }

    return changes;
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-border">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <FileBarChart className="w-8 h-8 text-blue-600" />
          Solicitações de Aprovação
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie alterações em cadastros médicos
        </p>
      </div>

      <div className="w-full px-4">
        <ScrollArea className="w-full">
          <div className="flex flex-nowrap gap-4 w-max p-4">
            {solicitacoes?.map((solicitacao) => (
              <Card
                key={solicitacao.id}
                onClick={() => handleSolicitacaoSelect(solicitacao)}
                className={`cursor-pointer transition-all hover:bg-accent/50 flex-shrink-0 min-w-[18rem] ${
                  selectedSolicitacao?.id === solicitacao.id
                    ? "ring-2 ring-primary bg-accent/30"
                    : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="text-xs bg-primary/20 text-primary">
                          {solicitacao.nomeCompleto
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-foreground truncate">
                          {solicitacao.nomeCompleto}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {solicitacao.especialidade}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      {getStatusBadge(solicitacao)}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">
                        Por: {solicitacao.user.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>
                        {new Date(solicitacao.createdAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-screen max-w-7xl mx-auto">
      <div>
        <SidebarContent />
      </div>
      <div className={`flex-1 overflow-auto`}>
        {selectedSolicitacao && (
          <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                  {selectedSolicitacao.nomeCompleto}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Alterações solicitadas em{" "}
                  {new Date(selectedSolicitacao.createdAt).toLocaleDateString(
                    "pt-BR"
                  )}{" "}
                  por {selectedSolicitacao.user.name}
                </p>
              </div>

              {!selectedSolicitacao.aprovada &&
                !selectedSolicitacao.rejeitada && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleReject(selectedSolicitacao.id)}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 w-full sm:w-auto"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedSolicitacao.id)}
                      className=" w-full sm:w-auto"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                  </div>
                )}
            </div>

            <div className="grid gap-4 md:gap-6">
              {Object.entries(getChanges(selectedSolicitacao)).map(
                ([field, change]) => (
                  <Card key={field}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        {field === "nomeCompleto" && (
                          <User className="w-4 h-4" />
                        )}
                        {field === "telefone" && <Phone className="w-4 h-4" />}
                        {field === "email" && <Mail className="w-4 h-4" />}
                        {field === "especialidade" && (
                          <Stethoscope className="w-4 h-4" />
                        )}
                        {field === "crm" && <FileText className="w-4 h-4" />}
                        {field === "nomeCompleto"
                          ? "Nome Completo"
                          : field === "telefone"
                          ? "Telefone"
                          : field === "especialidade"
                          ? "Especialidade"
                          : field.charAt(0).toUpperCase() + field.slice(1)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Valor Atual
                          </p>
                          <div className="p-3 bg-muted/50 rounded-md border">
                            <p className="text-sm text-foreground break-words">
                              {change.old}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Novo Valor
                          </p>
                          <div className="p-3 bg-primary/10 rounded-md border border-primary/20">
                            <p className="text-sm text-foreground font-medium break-words">
                              {change.new}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
