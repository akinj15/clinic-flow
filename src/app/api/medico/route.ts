import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatCpf(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, ""); // remove tudo que não é número
  if (cleaned.length !== 11) return cpf; // retorna original se não tiver 11 dígitos

  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// 🔹 Listar todos os médicos
export async function GET() {
  try {
    const medicos = await prisma.medico.findMany();
    return NextResponse.json(medicos);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao listar médicos" },
      { status: 500 }
    );
  }
}

// 🔹 Criar novo médico
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const novoMedico = await prisma.medico.create({
      data: {
        cpf: formatCpf(body.cpf),
        crm: body.crm,
        nomeCompleto: body.nomeCompleto,
        email: body.email,
        telefone: body.telefone,
        especialidade: body.especialidade,
        setor: body.setor, // precisa ser array de string
      },
    });

    return NextResponse.json(novoMedico, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar médico" },
      { status: 500 }
    );
  }
}
