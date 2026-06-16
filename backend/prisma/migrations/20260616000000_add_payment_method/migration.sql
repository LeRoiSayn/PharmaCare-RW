-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH_ON_DELIVERY', 'MTN_MOBILE_MONEY', 'AIRTEL_MONEY');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH_ON_DELIVERY';
ALTER TABLE "orders" ADD COLUMN "paymentPhone" TEXT;
