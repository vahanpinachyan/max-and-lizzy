-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "sku" TEXT;

-- AlterTable
ALTER TABLE "PendingIdramOrder" ADD COLUMN     "notes" TEXT;
