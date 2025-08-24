"use client";

import React, { useState, useEffect } from "react";
// import { Medico } from "@/entities/Medico";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Mail,
  Phone,
  Stethoscope,
  Search,
  Filter,
  Users,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TodosMedicos() {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEspecialidade, setFilterEspecialidade] = useState("todos");
  const [selectedMedicos, setSelectedMedicos] = useState([]);

  useEffect(() => {
    carregarMedicos();
  }, []);

  const carregarMedicos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/medico`);
      const data = await res.json();
      if (!data || data.error) {
        return;
      }
      setMedicos(data);
    } catch (error) {
      console.error("Erro ao carregar médicos:", error);
    } finally {
      setLoading(false);
    }
  };
  const deletarMedico = async (cpf: string) => {
      const res = await fetch(`/api/medico/${cpf.replace(/\D/g, "")}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao deletar médico");
  };

  const handleSelectMedico = (cpf) => {
    setSelectedMedicos((prev) =>
      prev.includes(cpf)
        ? prev.filter((medicoId) => medicoId !== cpf)
        : [...prev, cpf]
    );
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedMedicos.map((cpf) => deletarMedico(cpf)));
      setSelectedMedicos([]);
      carregarMedicos();
    } catch (error) {
      console.error("Erro ao deletar médicos:", error);
    }
  };

  const especialidades = [
    ...new Set(medicos.map((m) => m.especialidade).filter(Boolean)),
  ];

  const medicosFiltrados = medicos.filter((medico) => {
    const matchesSearch =
      medico.nomeCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.cpf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.crm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEspecialidade =
      filterEspecialidade === "todos" ||
      medico.especialidade === filterEspecialidade;

    return matchesSearch && matchesEspecialidade;
  });

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Todos os Médicos
          </h1>
          <p className="text-gray-600">
            {medicos.length} profissional{medicos.length !== 1 ? "is" : ""}{" "}
            cadastrado{medicos.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, CPF, CRM ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <Select
                  value={filterEspecialidade}
                  onValueChange={setFilterEspecialidade}
                >
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filtrar por especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">
                      Todas as especialidades
                    </SelectItem>
                    {especialidades.map((esp) => (
                      <SelectItem key={esp} value={esp}>
                        {esp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedMedicos.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar ({selectedMedicos.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja deletar {selectedMedicos.length}{" "}
                        médico(s) selecionado(s)? Esta ação é irreversível.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSelected}>
                        Deletar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicosFiltrados.map((medico) => (
            <Card
              key={medico.id}
              className={`shadow-lg border-2 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                selectedMedicos.includes(medico.id)
                  ? "border-blue-500"
                  : "border-transparent"
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 leading-tight">
                        {medico.nomeCompleto}
                      </h3>
                      <p className="text-sm text-blue-600 font-medium">
                        CPF: {medico.cpf}
                      </p>
                    </div>
                  </div>
                  <Checkbox
                    checked={selectedMedicos.includes(medico.cpf)}
                    onCheckedChange={() => handleSelectMedico(medico.cpf)}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {medico.crm && (
                  <p className="text-sm text-gray-500">CRM: {medico.crm}</p>
                )}
                {medico.especialidade && (
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-purple-500" />
                    <Badge className="bg-purple-100 text-purple-800">
                      {medico.especialidade}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-orange-500" />
                  <span className="text-sm truncate">{medico.email}</span>
                </div>
                {medico.telefone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{medico.telefone}</span>
                  </div>
                )}
                {medico.setor && medico.setor.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                      Setores:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {medico.setor.map((setor, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-indigo-50 text-indigo-700"
                        >
                          {setor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
