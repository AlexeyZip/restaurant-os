-- AlterEnum
-- Dine-in stopped being an Order concern: it belongs to Reservations
-- instead (booking an actual Table, which Order never was). Removing an
-- enum value in Postgres requires swapping the whole type - this is the
-- exact pattern `prisma migrate dev` generates for this operation.
BEGIN;
CREATE TYPE "OrderType_new" AS ENUM ('DELIVERY', 'TAKEAWAY');
ALTER TABLE "Order" ALTER COLUMN "orderType" TYPE "OrderType_new" USING ("orderType"::text::"OrderType_new");
ALTER TYPE "OrderType" RENAME TO "OrderType_old";
ALTER TYPE "OrderType_new" RENAME TO "OrderType";
DROP TYPE "OrderType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "tableNumber";
