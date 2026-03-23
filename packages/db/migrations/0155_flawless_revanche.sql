ALTER TABLE "subscription" ADD COLUMN "payment_provider" text DEFAULT 'stripe' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "tap_customer_id" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "tap_payment_agreement_id" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "tap_subscription_id" text;