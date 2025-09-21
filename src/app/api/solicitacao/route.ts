import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Criar nova solicitação de atualização
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(body);
    const solicitacao = await prisma.solicitacoesAtualizacao.create({
      data: {
        medicoId: body.medicoId,
        userId: body.userId,
        cpf: body.cpf,
        crm: body.crm,
        nomeCompleto: body.nomeCompleto,
        email: body.email,
        telefone: body.telefone,
        especialidade: body.especialidade,
        setor: body.setor,
        solicitacao: body.solicitacao, 
      },
    });

    return NextResponse.json(solicitacao, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar solicitação" },
      { status: 500 }
    );
  }
}

// Atualizar solicitação de atualização existente
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const solicitacaoAtualizada = await prisma.solicitacoesAtualizacao.update({
      where: { id: body.id },
      data: {
        aprovada: body.aprovada,
        rejeitada: body.rejeitada,
      },
    });

    return NextResponse.json(solicitacaoAtualizada);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao atualizar solicitação" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const medicos = await prisma.solicitacoesAtualizacao.findMany({
    where: {
      rejeitada: false,
      aprovada: false,
    },
    include: {
      user: true,
      medico: true,
    }
  });

  return NextResponse.json(medicos);
  
}
