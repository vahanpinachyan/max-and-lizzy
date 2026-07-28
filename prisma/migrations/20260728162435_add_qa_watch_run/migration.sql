-- CreateTable
CREATE TABLE "QaWatchRun" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pageCount" INTEGER NOT NULL,
    "problems" TEXT NOT NULL,

    CONSTRAINT "QaWatchRun_pkey" PRIMARY KEY ("id")
);
