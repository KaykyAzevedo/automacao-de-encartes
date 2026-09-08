/*
  Warnings:

  - Added the required column `format2Svg` to the `Theme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `format6Svg` to the `Theme` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Theme" ADD COLUMN     "format2Svg" TEXT NOT NULL,
ADD COLUMN     "format6Svg" TEXT NOT NULL;
