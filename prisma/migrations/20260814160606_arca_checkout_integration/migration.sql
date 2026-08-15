-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "arcaOrderId" TEXT;

-- CreateTable
CREATE TABLE "PendingArcaOrder" (
    "id" TEXT NOT NULL,
    "epgOrderId" TEXT,
    "amountAmd" INTEGER NOT NULL,
    "itemsJson" TEXT NOT NULL,
    "fulfillmentMethod" TEXT,
    "deliveryAddressJson" TEXT,
    "giftWrap" BOOLEAN NOT NULL DEFAULT false,
    "giftMessage" TEXT,
    "notes" TEXT,
    "promoCode" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingArcaOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingArcaOrder_epgOrderId_key" ON "PendingArcaOrder"("epgOrderId");

-- CreateIndex
CREATE INDEX "PendingArcaOrder_status_idx" ON "PendingArcaOrder"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Order_arcaOrderId_key" ON "Order"("arcaOrderId");
