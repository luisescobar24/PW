-- CreateTable
CREATE TABLE "Resena" (
    "id" SERIAL NOT NULL,
    "juegoId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "comentario" TEXT NOT NULL,
    "estrellas" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resena_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_juegoId_fkey" FOREIGN KEY ("juegoId") REFERENCES "Juego"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
