-- Scheduled sale window. All three columns are nullable with no default and
-- no backfill, so this is purely additive: existing rows are untouched and
-- read as "no scheduled sale". Safe to apply to a live database.
ALTER TABLE "Product" ADD COLUMN "salePercent" INTEGER;
ALTER TABLE "Product" ADD COLUMN "saleStartsAt" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN "saleEndsAt" TIMESTAMP(3);
