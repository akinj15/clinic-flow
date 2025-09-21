-- AlterTable
ALTER TABLE "public"."SolicitacoesAtualizacao" ADD COLUMN     "aprovada" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "rejeitada" SET DEFAULT false;
