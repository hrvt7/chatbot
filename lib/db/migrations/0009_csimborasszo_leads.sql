CREATE TABLE IF NOT EXISTS "Lead" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(120) NOT NULL,
  "phone" varchar(50) NOT NULL,
  "email" varchar(180),
  "preferredTime" varchar(120),
  "message" text NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
