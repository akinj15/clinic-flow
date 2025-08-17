import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export const consultaMedico = async (cpf: string) => {
  try {
    const medico = await prisma.medico.findFirst({
      where: { cpf },
    });
    return medico;
  } catch (error) {
    console.error("Erro ao consultar médico:", error);
    throw new Error("Erro ao consultar médico");
  }
};
