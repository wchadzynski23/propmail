-- AlterTable: add footer/signature fields to UserSettings
ALTER TABLE "UserSettings" ADD COLUMN IF NOT EXISTS "footerAgentName"  TEXT;
ALTER TABLE "UserSettings" ADD COLUMN IF NOT EXISTS "footerTitle"       TEXT;
ALTER TABLE "UserSettings" ADD COLUMN IF NOT EXISTS "footerPhone"       TEXT;
ALTER TABLE "UserSettings" ADD COLUMN IF NOT EXISTS "footerAddress"     TEXT;
ALTER TABLE "UserSettings" ADD COLUMN IF NOT EXISTS "footerWebsite"     TEXT;
ALTER TABLE "UserSettings" ADD COLUMN IF NOT EXISTS "footerCustomText"  TEXT;
