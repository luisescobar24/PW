/*
  Warnings:

  - Made the column `categoriaId` on table `Juego` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Juego" DROP CONSTRAINT "Juego_categoriaId_fkey";

-- AlterTable
ALTER TABLE "Juego" ALTER COLUMN "categoriaId" SET NOT NULL;

-- CreateTable
CREATE TABLE "Imagen" (
    "id" SERIAL NOT NULL,
    "juegoId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Imagen_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Juego" ADD CONSTRAINT "Juego_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imagen" ADD CONSTRAINT "Imagen_juegoId_fkey" FOREIGN KEY ("juegoId") REFERENCES "Juego"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
