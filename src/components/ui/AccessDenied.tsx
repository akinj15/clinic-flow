"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 p-6 flex items-center justify-center">
      <Card className="max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">Acesso Negado</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta funcionalidade. Entre em
            contato com o administrador do sistema.
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link
              href={"/dashboard"}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Início
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
