-- CreateTable
CREATE TABLE "sustainability_analysis" (
    "id" TEXT NOT NULL,
    "colorId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "advantages" TEXT[],
    "disadvantages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sustainability_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sustainability_analysis_colorId_key" ON "sustainability_analysis"("colorId");

-- CreateIndex
CREATE INDEX "sustainability_analysis_colorId_idx" ON "sustainability_analysis"("colorId");

-- AddForeignKey
ALTER TABLE "sustainability_analysis" ADD CONSTRAINT "sustainability_analysis_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "colors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
