CREATE TABLE IF NOT EXISTS "Contact" (
  "id"        TEXT         NOT NULL,
  "userId"    TEXT         NOT NULL,
  "email"     TEXT         NOT NULL,
  "name"      TEXT,
  "phone"     TEXT,
  "company"   TEXT,
  "notes"     TEXT,
  "tags"      TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Contact_pkey"          PRIMARY KEY ("id"),
  CONSTRAINT "Contact_user_email"    UNIQUE ("userId", "email"),
  CONSTRAINT "Contact_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
