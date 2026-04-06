-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Character" ADD COLUMN "templateId" TEXT;

-- Backfill legacy character templates into the new Template table.
INSERT INTO "Template" ("id", "name", "data", "createdAt", "createdById")
SELECT
    md5("template" || ':' || "userId") AS "id",
    "template" AS "name",
    '{}'::jsonb AS "data",
    MIN("createdAt") AS "createdAt",
    "userId" AS "createdById"
FROM "Character"
GROUP BY "template", "userId";

-- Point existing characters to their backfilled template record.
UPDATE "Character"
SET "templateId" = md5("template" || ':' || "userId")
WHERE "templateId" IS NULL;

-- Finish the schema change after data is preserved.
ALTER TABLE "Character" ALTER COLUMN "templateId" SET NOT NULL;
ALTER TABLE "Character" DROP COLUMN "template";

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
