/*
  Warnings:

  - You are about to drop the column `setores` on the `Medico` table. All the data in the column will be lost.
  - Added the required column `setor` to the `Medico` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Medico" DROP COLUMN "setores",
ADD COLUMN     "setor" TEXT NOT NULL,
ALTER COLUMN "especialidade" SET NOT NULL,
ALTER COLUMN "especialidade" SET DATA TYPE TEXT;
