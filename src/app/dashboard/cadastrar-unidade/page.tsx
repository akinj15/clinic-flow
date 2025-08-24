"use client";
import React, { useState, useEffect } from "react";
import GerenciadorItem from "./_components/GerenciadorItem";
import { Building } from "lucide-react";
import AccessDenied from "@/components/ui/AccessDenied";
import { authClient } from "@/lib/auth-client" // import the auth client
import { Prisma } from "@generated/prisma";

export default function GerenciarUnidades() {
  const { data: session, isPending: loadingUser } = authClient.useSession();
  const [user, setUser] = useState<Prisma.UserCreateInput>();

  useEffect(() => {

    if (!loadingUser) setUser(session?.user || undefined);
    
  }, [loadingUser, session?.user]);

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
            <Building className="w-8 h-8 text-blue-600" />
            Gerenciar Unidades
          </h1>
          <p className="text-gray-600">
            Adicione, edite ou remova as unidades hospitalares ou clínicas.
          </p>
        </div>

        <GerenciadorItem
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
      </div>
    </div>
  );
}
