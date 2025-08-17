/*
  Warnings:

  - Added the required column `detalhes` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Feedback" ADD COLUMN     "detalhes" TEXT NOT NULL;
