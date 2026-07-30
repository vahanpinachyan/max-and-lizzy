-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "idramBillNo" TEXT,
ADD COLUMN     "paymentProvider" TEXT NOT NULL DEFAULT 'stripe',
ALTER COLUMN "stripeSessionId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PendingIdramOrder" (
    "id" TEXT NOT NULL,
    "amountAmd" INTEGER NOT NULL,
    "itemsJson" TEXT NOT NULL,
    "fulfillmentMethod" TEXT,
    "deliveryAddressJson" TEXT,
    "giftWrap" BOOLEAN NOT NULL DEFAULT false,
    "giftMessage" TEXT,
    "promoCode" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingIdramOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PendingIdramOrder_status_idx" ON "PendingIdramOrder"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Order_idramBillNo_key" ON "Order"("idramBillNo");

