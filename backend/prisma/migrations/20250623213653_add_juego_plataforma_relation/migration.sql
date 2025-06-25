-- CreateTable
CREATE TABLE "_JuegoPlataforma" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_JuegoPlataforma_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_JuegoPlataforma_B_index" ON "_JuegoPlataforma"("B");

-- AddForeignKey
ALTER TABLE "_JuegoPlataforma" ADD CONSTRAINT "_JuegoPlataforma_A_fkey" FOREIGN KEY ("A") REFERENCES "Juego"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JuegoPlataforma" ADD CONSTRAINT "_JuegoPlataforma_B_fkey" FOREIGN KEY ("B") REFERENCES "Plataforma"("id") ON DELETE CASCADE ON UPDATE CASCADE;
