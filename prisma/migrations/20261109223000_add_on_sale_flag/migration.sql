-- Manual "Sale" tag, alongside featured/bestseller/newArrival. NOT NULL with a
-- default of false, so existing rows get the default without a backfill and no
-- product is marked on sale by the migration itself.
ALTER TABLE "Product" ADD COLUMN "onSale" BOOLEAN NOT NULL DEFAULT false;
