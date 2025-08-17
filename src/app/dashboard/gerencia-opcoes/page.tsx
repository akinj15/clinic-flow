"use client"
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GerenciadorItem from "./_components/GerenciadorItem";

import {
  SlidersHorizontal,
  MapPin,
  MessageSquare,
  Building,
} from "lucide-react";
import AccessDenied from "@/components/ui/AccessDenied";
import { authClient } from "@/lib/auth-client";
import { Prisma, Setor, TipoAbordagem, Unidade } from "../../../../generated/prisma";


interface Itens {
  id?: string;
  nome: string;
  estado?: string;
  [key: string]: unknown; // permite campos extras sem perder tipagem
}

export default function GerenciarOpcoes() {
  const [unidades, setUnidades] = useState<Itens[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [abordagem, setAbordagem] = useState<TipoAbordagem[]>([]);
  const [error, setError] = useState("");

  
  const [user, setUser] = useState<Prisma.UserCreateInput>(
    {} as Prisma.UserCreateInput
  );
  const { data: session, isPending: loadingUser } = authClient.useSession();

  useEffect(() => {
    if (!loadingUser) setUser(session?.user || ({} as Prisma.UserCreateInput));
  }, [loadingUser, session?.user]);


  const carregarUnidades = async () => {
    try {
      const res = await fetch("/api/unidade", { cache: "no-store" });
      if (!res.ok) throw new Error("Erro ao listar unidades");
      const data: Unidade[] = await res.json();
      setUnidades(data);
    } catch {
      setError(`Erro ao carregar unidades`);
    }
  };

  const gravaUnidade = async (data: Itens) => {
    const res = await fetch("/api/unidade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: data.nome,
        estado: data.estado || "CE",
      }),
    });
    if (!res.ok) throw new Error("Erro ao criar unidade");
  };

  const deleteUnidade = async (id: string | number) => {
    const res = await fetch(`/api/unidade/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Erro ao deletar unidade");
  };


  const carregarSetores = async () => {
    try {
      const res = await fetch("/api/setor", { cache: "no-store" });
      if (!res.ok) throw new Error("Erro ao listar setores");
      const data: Setor[] = await res.json();
      setSetores(data);
    } catch {
      setError(`Erro ao carregar unidades`);
    }
  };

  const gravaSetor = async (data: Prisma.SetorCreateInput) => {
    const res = await fetch("/api/setor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erro ao criar setor");
  };

  const deleteSetor = async (id: string | number) => {
    const res = await fetch(`/api/setor/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Erro ao deletar setor");
  };


  const carregarAbordagem = async () => {
    try {
      const res = await fetch("/api/tipo-abordagem", { cache: "no-store" });
      if (!res.ok) throw new Error("Erro ao listar abordagem");
      const data: TipoAbordagem[] = await res.json();
      setAbordagem(data);
    } catch {
      setError(`Erro ao carregar abordagem`);
    }
  };

  const gravaAbordagem = async (data: Prisma.TipoAbordagemCreateInput) => {
    const res = await fetch("/api/tipo-abordagem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erro ao criar abordagem");
  };

  const deleteAbordagem = async (id: string | number) => {
    const res = await fetch(`/api/tipo-abordagem/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Erro ao deletar abordagem");
  };



  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <SlidersHorizontal className="w-8 h-8 text-blue-600" />
            Gerenciar Opções
          </h1>
          <p className="text-gray-600">
            Adicione, edite ou remova as opções usadas nos formulários de
            feedback.
          </p>
        </div>

        <Tabs defaultValue="setores">
          <TabsList className="grid w-full grid-cols-3 bg-blue-100/70 p-1 rounded-xl">
            <TabsTrigger
              value="setores"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md rounded-lg"
            >
              <Building className="w-4 h-4" />
              Setores
            </TabsTrigger>
            <TabsTrigger
              value="abordagens"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md rounded-lg"
            >
              <MessageSquare className="w-4 h-4" />
              Tipos de Abordagem
            </TabsTrigger>
            <TabsTrigger
              value="unidades"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md rounded-lg"
            >
              <MapPin className="w-4 h-4" />
              Unidades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setores" className="mt-6">
            <GerenciadorItem
              items={setores}
              reloadItens={carregarSetores}
              deleteItem={deleteSetor}
              create={gravaSetor}
              title="Setores"
              description="Setores disponíveis para seleção no formulário de feedback."
              fields={[
                {
                  name: "nome",
                  label: "Nome do Setor",
                  placeholder: "Ex: Time Médico",
                },
              ]}
            />
          </TabsContent>

          <TabsContent value="abordagens" className="mt-6">
            <GerenciadorItem
              items={abordagem}
              reloadItens={carregarAbordagem}
              deleteItem={deleteAbordagem}
              create={gravaAbordagem}
              title="Tipos de Abordagem"
              description="Motivos de abordagem disponíveis para seleção."
              fields={[
                {
                  name: "nome",
                  label: "Nome da Abordagem",
                  placeholder: "Ex: CUSTO AGREGADO",
                },
              ]}
            />
          </TabsContent>

          <TabsContent value="unidades" className="mt-6">
            <GerenciadorItem
              items={unidades}
              reloadItens={carregarUnidades}
              deleteItem={deleteUnidade}
              create={gravaUnidade}
              title="Unidades"
              description="Unidades hospitalares ou clínicas, agrupadas por estado."
              fields={[
                {
                  name: "nome",
                  label: "Nome da Unidade",
                  placeholder: "Ex: Hospital Antônio Prudente",
                },
                { name: "estado", label: "Estado (UF)", placeholder: "Ex: CE" },
              ]}
              groupBy="estado"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
