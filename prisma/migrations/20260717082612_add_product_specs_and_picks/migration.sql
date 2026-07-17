-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "assemblyNote" TEXT,
ADD COLUMN     "assemblyRequired" BOOLEAN,
ADD COLUMN     "countryOfOrigin" TEXT,
ADD COLUMN     "packageContents" TEXT,
ADD COLUMN     "pickBy" TEXT,
ADD COLUMN     "pickNote" TEXT,
ADD COLUMN     "pickNoteHy" TEXT,
ADD COLUMN     "pickNoteRu" TEXT,
ADD COLUMN     "supervisionNote" TEXT,
ADD COLUMN     "warranty" TEXT;
