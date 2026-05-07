type D1Database = any;

interface CloudflareEnv {
  DB: D1Database;
  OPENROUTER_API_KEY?: string;
  AUTH_SECRET?: string;
  APP_ENV?: "demo" | "test-live" | "production";
  BRAIN_API_MODE?: "demo" | "test-live" | "production";
  AUTO_SEND_ENABLED?: "false" | "true";
  HUMAN_APPROVAL_REQUIRED?: "false" | "true";
  CRM_INTEGRATIONS_ENABLED?: "false" | "true";
  EMAIL_INTEGRATIONS_ENABLED?: "false" | "true";
}
