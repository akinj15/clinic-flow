import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔹 Listar todos os médicos
export async function GET() {
  try {
    const feedback = await prisma.feedback.findMany({ include: { medico: true } });
    return NextResponse.json(feedback);
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
    console.log(body);
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
