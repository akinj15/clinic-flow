"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  User,
  Mail,
  Phone,
  Stethoscope,
  FilePenLine,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Prisma } from "@generated/prisma";

interface Props {
  medico: Prisma.MedicoCreateInput;
  onIniciarFeedback: () => void;
  onMedicoAtualizado: (medico: Prisma.MedicoCreateInput) => void;
  user?: Prisma.UserCreateInput;
}

export default function DetalhesMedicoCard({
  medico,
  onIniciarFeedback,
  onMedicoAtualizado,
  user,
}: Props) {
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Prisma.MedicoCreateInput>({
    defaultValues: medico,
  });

  const onSubmit = async (dadosEditados: Prisma.MedicoCreateInput) => {
    setSalvando(true);
    setErro("");
    try {
      setEditando(false);
      if (user && user.role === "admin") {
        const res = await fetch("/api/medico/" + medico.cpf.replace(/\D/g, ""), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nomeCompleto: dadosEditados.nomeCompleto,
            email: dadosEditados.email,
            crm: dadosEditados.crm,
            telefone: dadosEditados.telefone,
            especialidade: dadosEditados.especialidade,
          }),
        });
        onMedicoAtualizado(dadosEditados);
      } else {
        const res = await fetch("/api/solicitacao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nomeCompleto: medico.nomeCompleto,
            cpf: medico.cpf,
            medicoId: medico.id,
            userId: user.id,
            email: medico.email,
            especialidade: medico.especialidade,
            crm: medico.crm,
            telefone: medico.telefone,
            solicitacao: dadosEditados,
          }),
        });
        if (!res.ok) throw new Error("Erro ao criar unidade");
      }
      setSucesso(true);
    } catch (err) {
      console.error("Erro ao salvar alterações", err);
      setErro("Erro ao salvar alterações");
    } finally {
      setSalvando(false);
    }
  };

  const handleCancelar = () => {
    reset(medico);
    setEditando(false);
    setErro("");
  };

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm py-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 py-6" />
            Informações do Profissional
          </div>
          {!editando && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditando(true)}
              className="text-white hover:bg-white/20"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        {sucesso && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {user.role === "admin"
                ? "Informações atualizadas com sucesso!"
                : "Solicitado alterações com sucesso! Aguarde a aprovação do administrador."}
            </AlertDescription>
          </Alert>
        )}

        {erro && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4" />
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Nome */}
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <Label className="text-sm font-medium text-blue-700 uppercase tracking-wide">
                  Nome Completo
                </Label>
              </div>
              {editando ? (
                <>
                  <Input
                    {...register("nomeCompleto", {
                      required: "Nome é obrigatório",
                    })}
                    className="text-lg font-semibold border-blue-200"
                  />
                  {errors.nomeCompleto && (
                    <p className="text-red-600 text-sm">
                      {errors.nomeCompleto.message}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-lg font-semibold text-gray-900">
                  {medico.nomeCompleto}
                </p>
              )}
            </div>

            {/* CRM */}
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Stethoscope className="w-5 h-5 text-green-600" />
                <Label className="text-sm font-medium text-green-700 uppercase tracking-wide">
                  CRM
                </Label>
              </div>
              {editando ? (
                <>
                  <Input
                    {...register("crm", { required: "CRM é obrigatório" })}
                    className="text-lg font-semibold border-green-200"
                  />
                  {errors.crm && (
                    <p className="text-red-600 text-sm">{errors.crm.message}</p>
                  )}
                </>
              ) : (
                <p className="text-lg font-semibold text-gray-900">
                  {medico.crm}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="bg-orange-50 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-orange-600" />
                <Label className="text-sm font-medium text-orange-700 uppercase tracking-wide">
                  Email
                </Label>
              </div>
              {editando ? (
                <>
                  <Input
                    type="email"
                    {...register("email", { required: "Email é obrigatório" })}
                    className="text-lg font-semibold border-orange-200"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-lg font-semibold text-gray-900">
                  {medico.email}
                </p>
              )}
            </div>

            {/* Telefone */}
            <div className="bg-teal-50 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5 text-teal-600" />
                <Label className="text-sm font-medium text-teal-700 uppercase tracking-wide">
                  Telefone
                </Label>
              </div>
              {editando ? (
                <Input
                  {...register("telefone")}
                  placeholder="(11) 99999-9999"
                  className="text-lg font-semibold border-teal-200"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">
                  {medico.telefone || "Não informado"}
                </p>
              )}
            </div>

            {/* Especialidade */}
            {editando && (
              <div className="bg-purple-50 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Stethoscope className="w-5 h-5 text-purple-600" />
                  <Label className="text-sm font-medium text-purple-700 uppercase tracking-wide">
                    Especialidade
                  </Label>
                </div>
                <Input
                  {...register("especialidade")}
                  placeholder="Ex: Cardiologia"
                  className="text-lg font-semibold border-purple-200"
                />
              </div>
            )}
          </div>

          {/* Botões */}
          <CardFooter className="flex justify-between p-6 bg-blue-50/30">
            {editando ? (
              <div className="flex gap-3 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelar}
                  disabled={salvando}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={salvando}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {salvando ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {user.role === "admin"
                    ? "Salvar Alterações"
                    : "Solicitar Alterações"}
                </Button>
              </div>
            ) : (
              <Button
                onClick={onIniciarFeedback}
                className="px-8 bg-blue-600 hover:bg-blue-700 ml-auto"
              >
                <FilePenLine className="w-4 h-4 mr-2" />
                Iniciar Feedback Médico
              </Button>
            )}
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
