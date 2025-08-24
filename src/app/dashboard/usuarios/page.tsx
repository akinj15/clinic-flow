"use client";
import React, { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import AccessDenied from "@/components/ui/AccessDenied";
import { authClient } from "@/lib/auth-client";
import { Prisma } from "@generated/prisma";

export default function GerenciarPermissoes() {
  const [currentUser, setCurrentUser] = useState<Prisma.UserCreateInput>(
    {} as Prisma.UserCreateInput
  );
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { data: session, isPending: loadingUser } = authClient.useSession();

  const loadData = async () => {
    setLoading(true);
    try {
      const usuariosData = await fetchUsuarios(page);
      setUsuarios(usuariosData.data);
      setTotalPages(usuariosData.pagination?.totalPages);
    } catch (error: any) {
      setError(error.message);
      setCurrentUser({} as Prisma.UserCreateInput);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingUser) setCurrentUser(session?.user || ({} as Prisma.UserCreateInput));
    if (!loadingUser && !session?.user) {
      setLoading(false);
      return;
    }

    loadData();
  }, [loadingUser, page]);



  const fetchUsuarios = async (page: number) => {
    const res = await fetch(`/api/users?page=${page}&limit=10`);
    if (!res.ok) throw new Error("Erro ao buscar usuários");
    return res.json();
  };

  const updatePermissao = async (id: number, data: any) => {
    const res = await fetch(`/api/users/${id}/permissions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erro ao atualizar permissão");
    return res.json();
  };


  // Alterar permissão
  const handlePermissaoChange = async (
    id: string,
    permitir: boolean
  ) => {
    setLoadingAction(true);
    setError("");
    setSuccess("");

    try {
      const permissaoExistente = usuarios.find(
        (p) =>
          p.id === id
      );

      if (permissaoExistente) {
        await updatePermissao(permissaoExistente.id, {
          role: permitir ? "admin" : "user",
        });
      }

      loadData();
      setSuccess("Permissão atualizada com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError("Erro ao atualizar permissão: " + error.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const getIsAdmin = (id: string) => {
    const permissao = usuarios.find(
      (p) => p.id === id && p.role === "admin"
    );
    return !!permissao;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Gerenciar Permissões
          </h1>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>
              Permissões de usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead>Usuário</TableHead>
                    <TableHead className="text-center">Admin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <p className="font-medium">{usuario.full_name}</p>
                        <p className="text-sm text-gray-500">{usuario.email}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={getIsAdmin(usuario.id)}
                          onCheckedChange={(checked) =>
                            handlePermissaoChange(usuario.id, checked)
                          }
                          disabled={loadingAction}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Paginação */}
        <div className="flex justify-between mt-4">
          <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Anterior
          </Button>
          <span>
            Página {page} de {totalPages}
          </span>
          <Button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Próxima
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="my-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="my-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
