-- Custom SQL migration: plans duration_days + tabelas pendentes (idempotente)

DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'plans'
			AND column_name = 'start_date'
	) THEN
		ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "duration_days" integer;

		UPDATE "plans"
		SET "duration_days" = GREATEST(1, (("end_date")::date - ("start_date")::date))
		WHERE "duration_days" IS NULL
			AND "start_date" IS NOT NULL
			AND "end_date" IS NOT NULL;

		UPDATE "plans"
		SET "duration_days" = 365
		WHERE "duration_days" IS NULL;

		ALTER TABLE "plans" ALTER COLUMN "duration_days" SET NOT NULL;
		ALTER TABLE "plans" DROP COLUMN IF EXISTS "start_date";
		ALTER TABLE "plans" DROP COLUMN IF EXISTS "end_date";
	ELSIF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'plans'
			AND column_name = 'duration_days'
	) THEN
		ALTER TABLE "plans" ADD COLUMN "duration_days" integer;
		UPDATE "plans" SET "duration_days" = 365 WHERE "duration_days" IS NULL;
		ALTER TABLE "plans" ALTER COLUMN "duration_days" SET NOT NULL;
	END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "company_module_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"module_key" text NOT NULL,
	"can_access" boolean DEFAULT false NOT NULL,
	"can_liberate" boolean DEFAULT false NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint
		WHERE conname = 'company_module_permissions_company_id_companies_id_fk'
	) THEN
		ALTER TABLE "company_module_permissions"
			ADD CONSTRAINT "company_module_permissions_company_id_companies_id_fk"
			FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id")
			ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "company_module_permissions_company_module_idx"
	ON "company_module_permissions" USING btree ("company_id","module_key");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "login_access_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_id" uuid,
	"session_id" uuid,
	"ip_address" text,
	"user_agent" text,
	"country" text,
	"region" text,
	"city" text,
	"logged_at" timestamp DEFAULT now() NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint
		WHERE conname = 'login_access_logs_user_id_user_id_fk'
	) THEN
		ALTER TABLE "login_access_logs"
			ADD CONSTRAINT "login_access_logs_user_id_user_id_fk"
			FOREIGN KEY ("user_id") REFERENCES "public"."user"("id")
			ON DELETE no action ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint
		WHERE conname = 'login_access_logs_company_id_companies_id_fk'
	) THEN
		ALTER TABLE "login_access_logs"
			ADD CONSTRAINT "login_access_logs_company_id_companies_id_fk"
			FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id")
			ON DELETE no action ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "login_access_logs_userId_idx"
	ON "login_access_logs" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "login_access_logs_loggedAt_idx"
	ON "login_access_logs" USING btree ("logged_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "login_access_logs_sessionId_idx"
	ON "login_access_logs" USING btree ("session_id");
