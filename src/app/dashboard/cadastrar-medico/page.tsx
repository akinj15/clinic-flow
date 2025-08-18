"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, X, Plus, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AccessDenied from "@/components/ui/AccessDenied";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client"; // import the auth client
import { Prisma } from "@generated/prisma";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const SETORES_DISPONIVEIS = [
  "Emergência",
  "UTI",
  "Cardiologia",
  "Neurologia",
  "Pediatria",
  "Cirurgia",
  "Ortopedia",
  "Dermatologia",
  "Ginecologia",
  "Psiquiatria",
  "Radiologia",
  "Laboratório",
];

const medicoSchema = z.object({
  id: z.string(),
  cpf: z.string().min(11, "CPF é obrigatório"),
  crm: z.string().optional(),
  nomeCompleto: z.string().min(3, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional(),
  especialidade: z.string().optional(),
  setor: z.array(z.string()).min(1, "Selecione pelo menos um setor"),
});

type MedicoFormData = z.infer<typeof medicoSchema>;

export default function CadastrarMedico() {
  const { data: session, isPending: loadingUser } = authClient.useSession();

  const [user, setUser] = useState<Prisma.UserCreateInput>();
  const [success, setSuccess] = useState(false);

  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MedicoFormData>({
    resolver: zodResolver(medicoSchema),
    defaultValues: {
      id: "",
      cpf: "",
      crm: "",
      nomeCompleto: "",
      email: "",
      telefone: "",
      especialidade: "",
      setor: [],
    },
  });

  const setoresSelecionados = watch("setor");

  async function fetchMedico(cpf: string) {
    try {
      const res = await fetch(`/api/medico?cpf=${encodeURIComponent(cpf)}`);
      const data = await res.json();
      if (data?.data) {
        const medicoData = data.data;
        setValue("cpf", medicoData.cpf);
        setValue("id", medicoData.id);
        setValue("crm", medicoData.crm);
        setValue("nomeCompleto", medicoData.nomeCompleto);
        setValue("email", medicoData.email);
        setValue("telefone", medicoData.telefone);
        setValue("especialidade", medicoData.especialidade);
        setValue("setor", medicoData.setor);
      }
    } catch (error) {
      console.error("Erro ao buscar médicos:", error);
    }
  }

  useEffect(() => {
    const cpfFromUrl = searchParams.get("cpf") || "";
    if (cpfFromUrl) {
      setValue("cpf", cpfFromUrl);
      fetchMedico(cpfFromUrl);
    }

    if (!loadingUser) setUser(session?.user || undefined);
  }, [searchParams, loadingUser, session?.user, setValue]);

  const toggleSetor = (setor: string) => {
    const current = setoresSelecionados || [];
    if (current.includes(setor)) {
      setValue(
        "setor",
        current.filter((s) => s !== setor)
      );
    } else {
      setValue("setor", [...current, setor]);
    }
  };

  const onSubmit = async (data: MedicoFormData) => {
    setSuccess(false);
    try {
      if (data.id) {
        await fetch("/api/medico/" + data.cpf, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        const res = await fetch("/api/medico", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.status === 500) {
          throw new Error("Já existe um médico cadastrado com este CPF");
        }
      }

      setSuccess(true);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-blue-600" />
            Cadastrar Médico
          </h1>
          <p className="text-gray-600">
            Adicione um novo profissional ao sistema
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle>Dados do Profissional</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* CPF */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    {...register("cpf")}
                  />
                  {errors.cpf && (
                    <p className="text-red-500 text-sm">{errors.cpf.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="crm">CRM</Label>
                  <Input
                    id="crm"
                    placeholder="Ex: 12345/SP"
                    {...register("crm")}
                  />
                </div>
              </div>

              {/* Nome */}
              <div>
                <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                <Input
                  id="nomeCompleto"
                  placeholder="Nome completo"
                  {...register("nomeCompleto")}
                />
                {errors.nomeCompleto && (
                  <p className="text-red-500 text-sm">
                    {errors.nomeCompleto.message}
                  </p>
                )}
              </div>

              {/* Email / Telefone */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    placeholder="(11) 99999-9999"
                    {...register("telefone")}
                  />
                </div>
              </div>

              {/* Especialidade */}
              <div>
                <Label htmlFor="especialidade">Especialidade</Label>
                <Input
                  id="especialidade"
                  placeholder="Ex: Cardiologia"
                  {...register("especialidade")}
                />
              </div>

              {/* Setores */}
              {/* <div>
                <Label className="mb-4 block">Setores de Atuação *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {SETORES_DISPONIVEIS.map((setor) => (
                    <Button
                      key={setor}
                      type="button"
                      onClick={() => toggleSetor(setor)}
                      variant={
                        setoresSelecionados.includes(setor)
                          ? "default"
                          : "outline"
                      }
                      className={`justify-start h-10 ${
                        setoresSelecionados.includes(setor)
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "border-blue-200 hover:bg-blue-50 hover:border-blue-400"
                      }`}
                    >
                      {setoresSelecionados.includes(setor) ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      {setor}
                    </Button>
                  ))}
                </div>
                {errors.setor && (
                  <p className="text-red-500 text-sm">{errors.setor.message}</p>
                )}
                {setoresSelecionados.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-700 mb-2">
                      Setores selecionados:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {setoresSelecionados.map((setor) => (
                        <Badge
                          key={setor}
                          className="bg-blue-100 text-blue-800 border-blue-200"
                        >
                          {setor}
                          <X
                            className="w-3 h-3 ml-2 cursor-pointer hover:bg-blue-200 rounded-full p-0.5"
                            onClick={() => toggleSetor(setor)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div> */}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Médico cadastrado com sucesso!
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Cadastrar Médico
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
