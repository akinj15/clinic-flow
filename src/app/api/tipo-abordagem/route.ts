import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const abordagens = await prisma.tipoAbordagem.findMany();
    return NextResponse.json(abordagens);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao listar tipos de abordagens" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { nome } = body;

    if (!nome) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const unidade = await prisma.tipoAbordagem.create({
      data: {
        nome,
      },
    });

    return NextResponse.json(unidade, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar tipo de abordagem:", error);
    return NextResponse.json(
      { error: "Erro ao criar tipo de abordagem" },
      { status: 500 }
    );
  }
}
