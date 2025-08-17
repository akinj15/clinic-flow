"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, CheckCircle, FileText } from "lucide-react";
import { Prisma, Setor, TipoAbordagem, Unidade } from "@generated/prisma";

// 🔹 Estados fixos
const todosEstados = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

// 🔹 Schema com zod
const schema = z
  .object({
    setor: z.string().min(1, "Setor é obrigatório"),
    estado: z.string().min(1, "Estado é obrigatório"),
    unidade: z.string().min(1, "Unidade é obrigatória"),
    tipoAbordagem: z.string().min(1, "Tipo de abordagem é obrigatório"),
    detalhes: z.string().optional(),
  })
  .refine(
    (data) =>
      data.tipoAbordagem !== "OUTRO MOTIVO" || !!data.detalhes,
    { message: "Por favor, descreva o motivo", path: ["detalhes"] }
  );

type FormData = z.infer<typeof schema>;

export default function FormularioAbordagem({
  medico,
  onFinalizar,
}: {
  medico: Prisma.MedicoCreateInput;
  onFinalizar: () => void;
}) {
  const [opcoes, setOpcoes] = useState({
    setores: [] as { id: string; nome: string }[],
    tiposAbordagem: [] as { id: string; nome: string }[],
    unidades: [] as { id: string; nome: string; estado: string }[],
  });

  const [success, setSuccess] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      setor: "",
      estado: "",
      unidade: "",
      tipoAbordagem: "",
      detalhes: "",
    },
  });

  const estadoSelecionado = watch("estado");
  const tipoAbordagem = watch("tipoAbordagem");

  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        let res = await fetch("/api/unidade", { cache: "no-store" });
        if (!res.ok) throw new Error("Erro ao listar unidades");
        const unidadesData: Unidade[] = await res.json();

        res = await fetch("/api/setor", { cache: "no-store" });
        if (!res.ok) throw new Error("Erro ao listar setores");
        const setoresData: Setor[] = await res.json();

        res = await fetch("/api/tipo-abordagem", { cache: "no-store" });
        if (!res.ok) throw new Error("Erro ao listar abordagem");
        const tiposAbordagemData: TipoAbordagem[] = await res.json();

        setOpcoes({
          setores: setoresData,
          tiposAbordagem: tiposAbordagemData,
          unidades: unidadesData,
        });
      } catch {
        console.error("Erro ao carregar opções do formulário.");
      }
    };
    carregarOpcoes();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setor: data.setor,
          medicoId: medico.id,
          estado: data.estado,
          unidade: data.unidade,
          especialidade: "",
          tipoAbordagem: data.tipoAbordagem,
          detalhes: data.detalhes,
          feedback: {},
        }),
      });
      if (!res.ok) throw new Error("Erro ao criar unidade");
      setSuccess(true);
      reset();
      setTimeout(() => onFinalizar(), 2000);
    } catch {
      console.error("Erro ao salvar abordagem.");
    }
  };

  const unidadesFiltradas = opcoes.unidades.filter(
    (u) => u.estado === estadoSelecionado
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="border-b border-blue-100">
            <CardTitle className="flex items-center gap-3 text-xl text-blue-800">
              <FileText className="w-6 h-6" />
              Feedback Médico
            </CardTitle>
            <div className="flex items-center gap-3 text-gray-700 pt-2 pl-1 bg-blue-50/50 p-3 rounded-lg mt-2">
              <User className="w-5 h-5 text-blue-600" />
              <p>
                <span className="font-medium">Profissional:</span>{" "}
                {medico.nomeCompleto} |{" "}
                <span className="font-medium">CRM:</span> {medico.crm}
              </p>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="p-8 space-y-6">
              {/* 🔹 Setor */}
              <div>
                <Label>Qual o setor?</Label>
                <Controller
                  control={control}
                  name="setor"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="mt-2 border-blue-200 h-11 w-full">
                        <SelectValue placeholder="Selecione um setor" />
                      </SelectTrigger>
                      <SelectContent>
                        {opcoes.setores.map((opt) => (
                          <SelectItem key={opt.id} value={opt.nome}>
                            {opt.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.setor && (
                  <p className="text-red-600 text-sm">{errors.setor.message}</p>
                )}
              </div>

              {/* 🔹 Estado e Unidade */}
              <div className="grid md:grid-cols-2 gap-6 items-end">
                <div>
                  <Label>Estado</Label>
                  <Controller
                    control={control}
                    name="estado"
                    render={({ field }) => (
                      <Select
                        onValueChange={(v) => {
                          field.onChange(v);
                          reset({ ...watch(), estado: v, unidade: "" });
                        }}
                        value={field.value}
                      >
                        <SelectTrigger className="mt-2 border-blue-200 h-11  w-full">
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {todosEstados.map((uf) => (
                            <SelectItem key={uf} value={uf}>
                              {uf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.estado && (
                    <p className="text-red-600 text-sm">
                      {errors.estado.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Unidade</Label>
                  <Controller
                    control={control}
                    name="unidade"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!estadoSelecionado}
                      >
                        <SelectTrigger className="mt-2 border-blue-200 h-11 w-full">
                          <SelectValue
                            placeholder={
                              estadoSelecionado
                                ? "Selecione a unidade"
                                : "Escolha um estado primeiro"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {unidadesFiltradas.map((u) => (
                            <SelectItem key={u.id} value={u.nome}>
                              {u.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.unidade && (
                    <p className="text-red-600 text-sm">
                      {errors.unidade.message}
                    </p>
                  )}
                </div>
              </div>

              {/* 🔹 Tipo Abordagem */}
              <div>
                <Label>Abordagem</Label>
                <Controller
                  control={control}
                  name="tipoAbordagem"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="mt-2 border-blue-200 h-11 w-full">
                        <SelectValue placeholder="Selecione o motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {opcoes.tiposAbordagem.map((opt) => (
                          <SelectItem key={opt.id} value={opt.nome}>
                            {opt.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.tipoAbordagem && (
                  <p className="text-red-600 text-sm">
                    {errors.tipoAbordagem.message}
                  </p>
                )}
              </div>

              {/* 🔹 Outro Motivo */}
              {tipoAbordagem === "OUTRO MOTIVO" && (
                <div>
                  <Label>Descreva o motivo</Label>
                  <Textarea
                    {...register("detalhes")}
                    placeholder="Detalhe aqui o motivo da abordagem..."
                    className="mt-2 border-blue-200 min-h-[88px]"
                  />
                  {errors.detalhes && (
                    <p className="text-red-600 text-sm">
                      {errors.detalhes.message}
                    </p>
                  )}
                </div>
              )}

              {/* 🔹 Feedback */}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Feedback registrado com sucesso! Retornando à busca...
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="flex justify-end p-6 bg-blue-50/30">
              <Button
                type="submit"
                disabled={isSubmitting || success}
                className="px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                {isSubmitting ? "Salvando..." : "Finalizar Feedback"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
