/*
  Warnings:

  - You are about to drop the column `url` on the `media_uploads` table. All the data in the column will be lost.
  - Added the required column `data` to the `media_uploads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filename` to the `media_uploads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimetype` to the `media_uploads` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "media_uploads" DROP COLUMN "url",
ADD COLUMN     "data" BYTEA NOT NULL,
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "mimetype" TEXT NOT NULL;
