/*
  Warnings:

  - Made the column `mediaId` on table `comments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "colors" ADD COLUMN     "aiDescription" TEXT,
ADD COLUMN     "bioregionId" TEXT,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "mediaId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media_uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
