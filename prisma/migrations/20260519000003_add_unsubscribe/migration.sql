-- Create Unsubscribe table for opt-out tracking (CAN-SPAM / GDPR)
CREATE TABLE IF NOT EXISTS "Unsubscribe" (
  "id"             TEXT NOT NULL,
  "token"          TEXT NOT NULL,
  "agentUserId"    TEXT NOT NULL,
  "email"          TEXT NOT NULL,
  "unsubscribedAt" TIMESTAMP(3),
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Unsubscribe_pkey"          PRIMARY KEY ("id"),
  CONSTRAINT "Unsubscribe_token_key"     UNIQUE ("token"),
  CONSTRAINT "Unsubscribe_agent_email"   UNIQUE ("agentUserId", "email"),
  CONSTRAINT "Unsubscribe_agentUserId_fkey"
    FOREIGN KEY ("agentUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
