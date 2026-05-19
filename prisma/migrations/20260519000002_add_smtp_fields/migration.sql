-- Add SMTP provider configuration fields to UserSettings
ALTER TABLE "UserSettings" ADD COLUMN IF NOT EXISTS "smtpProvider" TEXT;
ALTER TABLE "UserSettings" ADD COLUMN IF NOT EXISTS "smtpHost"     TEXT;
ALTER TABLE "UserSettings" ADD COLUMN IF NOT EXISTS "smtpPort"     INTEGER;
ALTER TABLE "UserSettings" ADD COLUMN IF NOT EXISTS "smtpSecure"   BOOLEAN;
ALTER TABLE "UserSettings" ADD COLUMN IF NOT EXISTS "smtpUser"     TEXT;
ALTER TABLE "UserSettings" ADD COLUMN IF NOT EXISTS "smtpPassword" TEXT;
