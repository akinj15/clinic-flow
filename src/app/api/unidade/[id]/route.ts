import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

// 🔹 Deletar unidade por ID
export async function DELETE(req: Request, { params }: Params) {
  try {
    const param = await params;

    if (!param.id) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await prisma.unidade.delete({
      where: { id: param.id },
    });

    return NextResponse.json({ message: "Unidade deletada com sucesso" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao deletar unidade" },
      { status: 500 }
    );
  }
}
