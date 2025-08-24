/* eslint-disable import/no-cycle */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PermissionData = {
  role?: string;
  banned?: boolean;
  banReason?: string;
};

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data: PermissionData = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar permissões:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar permissões" },
      { status: 500 }
    );
  }
}
