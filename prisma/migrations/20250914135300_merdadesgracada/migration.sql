/*
  Warnings:

  - Added the required column `rejeitada` to the `SolicitacoesAtualizacao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."SolicitacoesAtualizacao" ADD COLUMN     "rejeitada" BOOLEAN NOT NULL;
