/*
  Warnings:

  - The `status` column on the `Purchase` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `vendorId` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- First, add vendorId as nullable
ALTER TABLE "Purchase" ADD COLUMN "vendorId" TEXT;

-- Update existing records to use companyId as vendorId
UPDATE "Purchase" SET "vendorId" = "companyId" WHERE "vendorId" IS NULL;

-- Now make vendorId required
ALTER TABLE "Purchase" ALTER COLUMN "vendorId" SET NOT NULL;

-- Add isVendorAccepted with default value
ALTER TABLE "Purchase" ADD COLUMN "isVendorAccepted" BOOLEAN NOT NULL DEFAULT false;

-- Convert status to enum
-- First, create a temporary column
ALTER TABLE "Purchase" ADD COLUMN "status_enum" "PurchaseStatus";

-- Convert existing status values to enum
UPDATE "Purchase" 
SET "status_enum" = CASE 
    WHEN "status" = 'PENDING' THEN 'PENDING'::"PurchaseStatus"
    WHEN "status" = 'IN_PROGRESS' THEN 'IN_PROGRESS'::"PurchaseStatus"
    WHEN "status" = 'COMPLETED' THEN 'COMPLETED'::"PurchaseStatus"
    WHEN "status" = 'FAILED' THEN 'FAILED'::"PurchaseStatus"
    ELSE 'PENDING'::"PurchaseStatus"
END;

-- Drop old status column
ALTER TABLE "Purchase" DROP COLUMN "status";

-- Rename new column to status
ALTER TABLE "Purchase" RENAME COLUMN "status_enum" TO "status";

-- Make status required with default
ALTER TABLE "Purchase" ALTER COLUMN "status" SET NOT NULL,
                       ALTER COLUMN "status" SET DEFAULT 'PENDING'::"PurchaseStatus";
