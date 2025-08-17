import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const setores = await prisma.setor.findMany();
    return NextResponse.json(setores);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao listar setores" },
      { status: 500 }
    );
  }
}
// Criar uma setor
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

    const setor = await prisma.setor.create({
      data: {
        nome,
      },
    });

    return NextResponse.json(setor, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar setor:", error);
    return NextResponse.json(
      { error: "Erro ao criar setor" },
      { status: 500 }
    );
  }
}
