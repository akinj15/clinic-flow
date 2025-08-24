import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔹 Listar todos os médicos
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");
    const medicoId = searchParams.get("medicoId");
    const setor = searchParams.get("setor");
    const tipoAbordagem = searchParams.get("tipoAbordagem");

    const feedbacks = await prisma.feedback.findMany({
      where: {
        ...(medicoId ? { medicoId } : {}),
        ...(setor ? { setor } : {}),
        ...(tipoAbordagem ? { tipoAbordagem } : {}),
        ...(dataInicio || dataFim
          ? {
              createdAt: {
                ...(dataInicio ? { gte: new Date(dataInicio) } : {}),
                ...(dataFim ? { lte: new Date(`${dataFim}T23:59:59`) } : {}),
              },
            }
          : {}),
      },
      include: { medico: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao listar feedbacks" },
      { status: 500 }
    );
  }
}

// 🔹 Criar novo médico
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const resposta = await prisma.feedback.create({
      data: body,
    });

    return NextResponse.json(resposta, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar feedback" },
      { status: 500 }
    );
  }
}
