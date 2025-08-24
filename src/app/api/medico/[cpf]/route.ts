import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ cpf: string }>;
};

function formatCpf(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, ""); // remove tudo que não é número
  if (cleaned.length !== 11) return cpf; // retorna original se não tiver 11 dígitos

  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
// 🔹 Buscar médico por CPF
export async function GET(req: Request, { params }: Params) {
  try {

    const param = await params; 

    const medico = await prisma.medico.findUnique({
      where: { cpf: formatCpf(param.cpf) },
    });

    if (!medico) {
      return NextResponse.json(
        { error: "Médico não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(medico);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar médico" },
      { status: 500 }
    );
  }
}

// 🔹 Atualizar médico
export async function PUT(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const param = await params; 


    const medicoAtualizado = await prisma.medico.update({
      where: { cpf: formatCpf(param.cpf) },
      data: {
        crm: body.crm,
        nomeCompleto: body.nomeCompleto,
        email: body.email,
        telefone: body.telefone,
        especialidade: body.especialidade,
        setor: body.setor, // precisa ser array de string
      },
    });

    return NextResponse.json(medicoAtualizado);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao atualizar médico" },
      { status: 500 }
    );
  }
}

// 🔹 Deletar médico
export async function DELETE(req: Request, { params }: Params) {
  try {
    const param = await params; 
    await prisma.medico.delete({
      where: { cpf: formatCpf(param.cpf) },
    });

    return NextResponse.json({ message: "Médico deletado com sucesso" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao deletar médico" },
      { status: 500 }
    );
  }
}
