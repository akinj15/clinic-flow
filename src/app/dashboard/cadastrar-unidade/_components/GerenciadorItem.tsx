"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Trash2, Plus, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// 🔹 Campos que o formulário pode receber
type Field = {
  name: string;
  label: string;
  placeholder: string;
};

// 🔹 Props do componente
type Props = {
  title: string;
  description?: string;
  fields: Field[];
  groupBy?: string;
};

// 🔹 Estrutura do item retornado pela API
interface Unidade {
  id: string | number;
  nome: string;
  [key: string]: unknown; // permite campos extras sem perder tipagem
}

// 🔹 Estrutura de dados do formulário
type FormData = {
  [key: string]: string;
};

export default function GerenciadorItem({
  title,
  description,
  fields,
  groupBy,
}: Props) {
  const [items, setItems] = useState<Unidade[]>([]);
  const [error, setError] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState<string | number | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const carregarItens = async () => {
    try {
      const res = await fetch("/api/unidade", { cache: "no-store" });
      if (!res.ok) throw new Error("Erro ao listar unidades");
      const data: Unidade[] = await res.json();
      setItems(data);
    } catch {
      setError(`Erro ao carregar ${title.toLowerCase()}`);
    }
  };

  useEffect(() => {
    carregarItens();
  }, []);

  // 🔹 Criar item
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoadingAdd(true);
    try {
      const res = await fetch("/api/unidade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erro ao criar unidade");
      reset();
      carregarItens();
    } catch {
      setError(`Erro ao adicionar ${title.toLowerCase()}.`);
    } finally {
      setLoadingAdd(false);
    }
  };

  // 🔹 Deletar item
  const handleDeleteItem = async (id: string | number) => {
    setLoadingDelete(id);
    try {
      const res = await fetch(`/api/unidade/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao deletar unidade");
      carregarItens();
    } catch {
      setError(`Erro ao deletar item.`);
    } finally {
      setLoadingDelete(null);
    }
  };

  // 🔹 Agrupar se necessário
  const groupedItems: Record<string, Unidade[]> = groupBy
    ? items.reduce((acc: Record<string, Unidade[]>, item) => {
        const key = String(item[groupBy]) || "Sem Grupo";
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {})
    : { [title]: items };

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-lg bg-blue-50/50"
        >
          {fields.map((field) => (
            <div key={field.name} className="flex-1">
              <Input
                placeholder={field.placeholder}
                {...register(field.name, { required: true })}
              />
              {errors[field.name] && (
                <span className="text-red-500 text-sm">
                  {field.placeholder} é obrigatório
                </span>
              )}
            </div>
          ))}
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={loadingAdd}
          >
            {loadingAdd ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {loadingAdd ? "Adicionando..." : "Adicionar"}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 max-h-96 overflow-auto pr-2">
          {Object.keys(groupedItems)
            .sort()
            .map((groupName) => (
              <div key={groupName}>
                {groupBy && (
                  <h3 className="font-semibold text-blue-700 mb-2 border-b pb-1">
                    {groupName}
                  </h3>
                )}
                <ul className="space-y-2">
                  {groupedItems[groupName].map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-white rounded-md shadow-sm"
                    >
                      <span className="text-gray-800">{item.nome}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={loadingDelete === item.id}
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        {loadingDelete === item.id ? (
                          <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-500" />
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
