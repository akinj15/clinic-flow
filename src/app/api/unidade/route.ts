import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const unidades = await prisma.unidade.findMany();
    return NextResponse.json(unidades);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao listar unidades" },
      { status: 500 }
    );
  }
}
// Criar uma unidade
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { nome, estado } = body;

    if (!nome) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const unidade = await prisma.unidade.create({
      data: {
        nome,
        estado,
      },
    });

    return NextResponse.json(unidade, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar unidade:", error);
    return NextResponse.json(
      { error: "Erro ao criar unidade" },
      { status: 500 }
    );
  }
}
