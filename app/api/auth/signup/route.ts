import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { createId, getD1Database } from "@/lib/cloudflare-db";
import { PLAN_CREDITS, trialEndDate } from "@/lib/billing";

export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || `org-${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const confirmPassword = String(body.confirmPassword || "");
    const organizationName = String(body.organizationName || "").trim();
    const industry = String(body.industry || "").trim();

    if (!firstName || !lastName || !email || !password || !organizationName) {
      return NextResponse.json({ error: "First name, last name, work email, password, and organization are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid work email." }, { status: 400 });
    if (password !== confirmPassword) return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    if (!body.acceptTerms || !body.acceptTrial) return NextResponse.json({ error: "Terms and trial acknowledgement are required." }, { status: 400 });

    const db = await getD1Database();
    if (!db) return NextResponse.json({ error: "Signup requires the Cloudflare demo/test database." }, { status: 503 });

    const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) return NextResponse.json({ error: "Email already exists." }, { status: 409 });

    const userId = createId("user");
    const orgId = createId("org");
    const membershipId = createId("membership");
    const subId = createId("sub");
    const auditId = createId("audit");
    const credits = PLAN_CREDITS.Trial;
    const start = new Date().toISOString();
    const end = trialEndDate(14);
    const passwordHash = await bcrypt.hash(password, 10);
    const slugBase = slugify(organizationName);
    const slug = `${slugBase}-${orgId.slice(-6)}`;

    await db.batch([
      db.prepare(`
        INSERT INTO users (id, email, first_name, last_name, job_title, password_hash, status)
        VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
      `).bind(userId, email, firstName, lastName, body.jobTitle || null, passwordHash),
      db.prepare(`
        INSERT INTO organizations (id, name, slug, plan, subscription_status, ai_credits, status, industry, environment, trial_start_date, trial_end_date, credits_used, credits_remaining)
        VALUES (?, ?, ?, 'Trial', 'TRIAL_ACTIVE', ?, 'ACTIVE', ?, ?, ?, ?, 0, ?)
      `).bind(orgId, organizationName, slug, credits, industry || null, process.env.APP_ENV || "test-live", start, end, credits),
      db.prepare(`
        INSERT INTO memberships (id, user_id, organization_id, role, status)
        VALUES (?, ?, ?, 'CLIENT_ADMIN', 'ACTIVE')
      `).bind(membershipId, userId, orgId),
      db.prepare(`
        INSERT INTO subscriptions (id, organization_id, plan_id, status, trial_start_date, trial_end_date, credits_included, credits_used, credits_remaining)
        VALUES (?, ?, 'plan_trial', 'TRIAL_ACTIVE', ?, ?, ?, 0, ?)
      `).bind(subId, orgId, start, end, credits, credits),
      db.prepare(`
        INSERT INTO brain_settings (id, organization_id, task_name, selected_model, purpose, cost_mode)
        VALUES (?, ?, 'Default Brain Workspace', 'openai/gpt-5-mini', 'Empty trial Brain Center workspace', 'BALANCED')
      `).bind(createId("brain"), orgId),
      db.prepare(`
        INSERT INTO audit_log (id, actor_user_id, organization_id, action, target_type, target_id, metadata)
        VALUES (?, ?, ?, 'SIGNUP_TRIAL_CREATED', 'ORGANIZATION', ?, ?)
      `).bind(auditId, userId, orgId, orgId, JSON.stringify({ email, plan: "Trial", credits })),
    ]);

    return NextResponse.json({
      success: true,
      id: userId,
      email,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      role: "CLIENT_ADMIN",
      orgId,
      orgName: organizationName,
      plan: "Trial",
      subscriptionStatus: "TRIAL_ACTIVE",
      aiCredits: credits,
      creditsRemaining: credits,
      trialEndsAt: end,
      message: "Trial account created. You have 100 AI Credits available.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Could not create account." }, { status: 500 });
  }
}
