-- CreateTable
CREATE TABLE "ImagenNoticia" (
    "id" SERIAL NOT NULL,
    "noticiaId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "ImagenNoticia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ImagenNoticia" ADD CONSTRAINT "ImagenNoticia_noticiaId_fkey" FOREIGN KEY ("noticiaId") REFERENCES "Noticia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
