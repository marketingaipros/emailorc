#!/usr/bin/env bash
set -euo pipefail

mkdir -p app/{login,dashboard,campaigns/new,campaigns/[id]/rows/[rowId],knowledge,settings,api/campaigns/[id]/upload,api/campaigns/[id]/export,api/campaigns/[id],api/campaigns,api/rows/[id]/process,api/rows/[id]/qa,api/rows/[id]/final,api/knowledge}
mkdir -p prisma src/{lib,types,services,services/ai,prompts,utils} tests

cat > package.json <<'JSON'
{
  "name": "vrf-campaign-orchestrator",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@prisma/client": "^5.14.0",
    "date-fns": "^3.6.0",
    "next": "14.2.5",
    "papaparse": "^5.4.1",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "xlsx": "^0.18.5",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.14.8",
    "@types/papaparse": "^5.3.14",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "prisma": "^5.14.0",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.5.3",
    "vitest": "^2.0.2"
  },
  "engines": { "node": ">=20.0.0", "npm": ">=10.0.0" }
}
JSON

cat > .gitignore <<'EOF2'
node_modules
.next
.env
coverage
EOF2

cat > .env.example <<'EOF2'
DATABASE_URL="postgresql://user:password@localhost:5432/vrf"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AI_PROVIDER="openai"
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
GEMINI_API_KEY=""
AUTH_SECRET="replace"
EOF2

cat > tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "types": ["vitest/globals", "node"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
JSON

cat > next.config.mjs <<'JS'
/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;
JS

cat > app/layout.tsx <<'TS'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
TS

cat > app/page.tsx <<'TS'
import Link from "next/link";
export default function Home() {
  return <main className="p-8"><h1 className="text-2xl font-bold">VRF Campaign Orchestrator</h1><Link href="/dashboard" className="underline">Go to dashboard</Link></main>;
}
TS

cat > app/login/page.tsx <<'TS'
export default function LoginPage(){return <main className='p-8 max-w-md mx-auto'><h1 className='text-2xl font-bold mb-4'>Login</h1><div className='border rounded p-4 bg-white'>Auth provider placeholder (Clerk/Auth.js)</div></main>}
TS

cat > app/dashboard/page.tsx <<'TS'
export default function Dashboard(){const cards=['Total Rows Uploaded','Rows Processed','Rows Needing Review','Final Output Ready','Average QA Score'];return <main className='p-8'><h1 className='text-2xl font-bold mb-6'>Dashboard</h1><div className='grid grid-cols-1 md:grid-cols-3 gap-4'>{cards.map(c=><div key={c} className='bg-white border rounded p-4'><p className='text-sm text-slate-500'>{c}</p><p className='text-xl font-semibold'>--</p></div>)}</div></main>}
TS

cat > app/campaigns/page.tsx <<'TS'
import Link from 'next/link'; export default function Campaigns(){return <main className='p-8'><h1 className='text-2xl font-bold'>Campaigns</h1><Link href='/campaigns/new' className='underline'>New Campaign</Link></main>}
TS
cat > app/campaigns/new/page.tsx <<'TS'
export default function NewCampaign(){return <main className='p-8'><h1 className='text-2xl font-bold mb-4'>Create Campaign</h1><div className='bg-white border rounded p-4'>Upload CSV/XLSX, paste rows, and map required columns.</div></main>}
TS
cat > app/campaigns/[id]/page.tsx <<'TS'
export default function CampaignDetail(){return <main className='p-8'><h1 className='text-2xl font-bold mb-4'>Campaign Detail</h1><div className='bg-white border rounded p-4'>Rows table, status filters, and bulk actions placeholders.</div></main>}
TS
cat > app/campaigns/[id]/rows/[rowId]/page.tsx <<'TS'
export default function RowDetail(){return <main className='p-8'><h1 className='text-2xl font-bold mb-4'>Row Detail</h1><div className='grid md:grid-cols-2 gap-4'><div className='bg-white border rounded p-4'>Original + validation + strategy</div><div className='bg-white border rounded p-4'>Draft + QA + final output + revisions</div></div></main>}
TS
cat > app/knowledge/page.tsx <<'TS'
export default function Knowledge(){return <main className='p-8'><h1 className='text-2xl font-bold mb-4'>Knowledge Base</h1><div className='bg-white border rounded p-4'>Manage facts, banned phrases, tone and CTA preferences.</div></main>}
TS
cat > app/settings/page.tsx <<'TS'
export default function Settings(){return <main className='p-8'><h1 className='text-2xl font-bold mb-4'>Settings</h1><div className='bg-white border rounded p-4'>Provider/API keys, brand voice, banned phrases.</div></main>}
TS

cat > src/types/domain.ts <<'TS'
export type CampaignMode = "Renewal-Upsell" | "Renewal-Protection" | "Renewal-Acceleration" | "Renewal-Reactivation" | "Unknown";
export type ValidationFlag = "Needs Review" | "Out of Window" | "Insufficient Personalization" | "Missing Critical Data";
export type RowInput = { sourceRowId: string; businessName?: string; decisionMaker?: string; email?: string; renewalDate?: string; daysToRenew?: number | null; industry?: string; offerType?: string; notes?: string; };
TS

cat > src/utils/validation.ts <<'TS'
import { differenceInCalendarDays } from "date-fns";
import { CampaignMode, RowInput, ValidationFlag } from "../types/domain";
export function calculateDaysToRenew(renewalDate: Date, now = new Date()): number { return differenceInCalendarDays(renewalDate, now); }
export function classifyCampaignMode(daysToRenew: number, offerType = ""): CampaignMode {
  const o = offerType.toLowerCase();
  if (daysToRenew < 0) return "Renewal-Reactivation";
  if (daysToRenew >= 15 && daysToRenew <= 25) return "Renewal-Acceleration";
  if (/(upgrade|add-on|cloud|automation)/.test(o) && daysToRenew >= 15 && daysToRenew <= 45) return "Renewal-Upsell";
  if (daysToRenew <= 45) return "Renewal-Protection";
  return "Unknown";
}
export function detectBannedPhrases(text: string, banned: string[]): string[] {
  const l = text.toLowerCase();
  return banned.filter((b) => l.includes(b.toLowerCase()));
}
export function validateRow(input: RowInput, now = new Date()) {
  const missing: string[] = [];
  if (!input.sourceRowId) missing.push("Source_Row_ID");
  if (!input.renewalDate) missing.push("Renewal_Date");
  if (!(input.businessName || input.decisionMaker)) missing.push("Business_Name_or_Decision_Maker");
  let days = input.daysToRenew ?? null;
  if (days == null && input.renewalDate) days = calculateDaysToRenew(new Date(input.renewalDate), now);
  if (days == null) missing.push("Days_to_Renew");
  const flags: ValidationFlag[] = [];
  if (missing.length) flags.push("Missing Critical Data");
  if (days != null && (days < 15 || days > 45)) flags.push("Out of Window");
  const personalizationFields = [input.businessName, input.decisionMaker, input.industry, input.notes].filter(Boolean).length;
  if (personalizationFields < 2) flags.push("Insufficient Personalization");
  if (flags.length) flags.unshift("Needs Review");
  return { missingFields: missing, flags: [...new Set(flags)], isValid: flags.length === 0, daysToRenew: days, campaignMode: days != null ? classifyCampaignMode(days, input.offerType) : "Unknown" as CampaignMode };
}
TS

cat > src/prompts/templates.ts <<'TS'
export const PROMPTS = {
  sentinel: `Generate strategy JSON with Strategic_Angle, Core_Risk, Upsell_Bridge, Value_Outcome, CTA_Direction, Tone_Guidance, Red_Flags.`,
  scribe: `Generate email JSON: Subject_Line_1, Subject_Line_2, Preview_Text, Email_Body (90-180 words), CTA, Personalization_Used, Writer_Notes. Avoid banned phrases and hype.`,
  lexi: `QA score 1-10 and revise. Return JSON fields required by QAOutput schema.`,
  scribeRevision: `Revise SCRIBE draft per issues while preserving factual grounding only.`,
  sentinelRevision: `Revise strategy when relevance/offer framing issues are detected.`
};
TS

cat > src/services/ai/provider.ts <<'TS'
export interface AIProvider { generate(prompt: string, input: unknown): Promise<any>; }
export class MockAIProvider implements AIProvider {
  async generate(prompt: string, input: any) { return { promptUsed: prompt, input }; }
}
TS

cat > src/services/campaign-orchestrator.ts <<'TS'
import { PROMPTS } from "../prompts/templates";
import { AIProvider } from "./ai/provider";
import { RowInput } from "../types/domain";
import { validateRow } from "../utils/validation";

export async function processRow(row: RowInput, provider: AIProvider) {
  const intake = validateRow(row);
  if (!intake.isValid) return { intake, status: "NEEDS_REVIEW", finalOutputReady: false };
  let strategy = await provider.generate(PROMPTS.sentinel, { row, intake });
  let draft = await provider.generate(PROMPTS.scribe, { row, strategy });
  let qa = await provider.generate(PROMPTS.lexi, { row, strategy, draft });
  let attempts = 0;
  while ((qa.overallQualityScore ?? 8) < 9 && attempts < 3) {
    attempts++;
    const strategicIssue = String(qa.topIssuesLoweringScore ?? "").toLowerCase().includes("strategy");
    if (strategicIssue) strategy = await provider.generate(PROMPTS.sentinelRevision, { row, strategy, qa });
    draft = await provider.generate(PROMPTS.scribeRevision, { row, strategy, qa });
    qa = await provider.generate(PROMPTS.lexi, { row, strategy, draft });
  }
  const approved = (qa.overallQualityScore ?? 0) >= 9;
  return { intake, strategy, draft, qa: { ...qa, revisionCount: attempts }, finalOutputReady: approved, status: approved ? "FINAL_OUTPUT_READY" : "NEEDS_REVIEW" };
}
TS

cat > src/lib/prisma.ts <<'TS'
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
TS

cat > prisma/schema.prisma <<'PRISMA'
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql" url = env("DATABASE_URL") }
enum CampaignStatus { DRAFT ACTIVE COMPLETED }
enum ProcessingStatus { PENDING VALID NEEDS_REVIEW APPROVED FINAL_OUTPUT_READY }
enum CampaignMode { RENEWAL_UPSELL RENEWAL_PROTECTION RENEWAL_ACCELERATION RENEWAL_REACTIVATION UNKNOWN }
enum KnowledgeType { FACT PRODUCT OFFER FAQ BANNED_PHRASE TONE_PREFERENCE CTA_PREFERENCE }
model User { id String @id @default(cuid()) email String @unique name String? role String @default("admin") createdAt DateTime @default(now()) updatedAt DateTime @updatedAt campaigns Campaign[] }
model Campaign { id String @id @default(cuid()) name String description String? status CampaignStatus @default(DRAFT) createdById String createdBy User @relation(fields: [createdById], references: [id]) rows CampaignRow[] learningLog LearningLogEntry[] createdAt DateTime @default(now()) updatedAt DateTime @updatedAt }
model CampaignRow { id String @id @default(cuid()) campaignId String campaign Campaign @relation(fields: [campaignId], references: [id]) sourceRowId String businessName String? decisionMaker String? email String? renewalDate DateTime? daysToRenew Int? industry String? offerType String? notes String? normalizedJson Json? validationStatus Json? missingFieldsJson Json? campaignMode CampaignMode @default(UNKNOWN) processingStatus ProcessingStatus @default(PENDING) finalOutputReady Boolean @default(false) strategies StrategyOutput[] drafts EmailDraft[] qaOutputs QAOutput[] createdAt DateTime @default(now()) updatedAt DateTime @updatedAt }
model StrategyOutput { id String @id @default(cuid()) campaignRowId String campaignRow CampaignRow @relation(fields:[campaignRowId], references:[id]) strategicAngle String coreRisk String upsellBridge String valueOutcome String ctaDirection String toneGuidance String redFlags String version Int @default(1) createdAt DateTime @default(now()) }
model EmailDraft { id String @id @default(cuid()) campaignRowId String campaignRow CampaignRow @relation(fields:[campaignRowId], references:[id]) subjectLine1 String subjectLine2 String previewText String emailBody String cta String personalizationUsed String writerNotes String version Int @default(1) createdAt DateTime @default(now()) }
model QAOutput { id String @id @default(cuid()) campaignRowId String campaignRow CampaignRow @relation(fields:[campaignRowId], references:[id]) qaStatus String spamRiskLevel String issuesFound String revisionsMade String finalSubjectLine1 String finalSubjectLine2 String finalPreviewText String finalEmailBody String finalCta String humanizationNotes String overallQualityScore Int approvalStatus String revisionCount Int topIssuesLoweringScore String requiredFixes String version Int @default(1) createdAt DateTime @default(now()) }
model KnowledgeBaseEntry { id String @id @default(cuid()) title String type KnowledgeType content String active Boolean @default(true) createdAt DateTime @default(now()) updatedAt DateTime @updatedAt }
model LearningLogEntry { id String @id @default(cuid()) campaignId String campaign Campaign @relation(fields:[campaignId], references:[id]) rowId String category String note String createdAt DateTime @default(now()) }
PRISMA

cat > prisma/seed.ts <<'TS'
import { PrismaClient, CampaignMode, ProcessingStatus } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.upsert({ where: { email: "demo@vrf.local" }, update: {}, create: { email: "demo@vrf.local", name: "Demo Admin" } });
  const campaign = await prisma.campaign.create({ data: { name: "Q2 Sage Renewal", description: "Demo campaign", createdById: user.id, status: "ACTIVE" } });
  await prisma.campaignRow.createMany({ data: [
    { campaignId: campaign.id, sourceRowId: "1", businessName: "Acme Services", decisionMaker: "Jordan Lee", email: "jordan@acme.com", renewalDate: new Date(Date.now()+1000*60*60*24*22), daysToRenew: 22, industry: "Professional Services", offerType: "Sage50cloud upgrade", notes: "Interested in cloud access", campaignMode: CampaignMode.RENEWAL_UPSELL, processingStatus: ProcessingStatus.VALID },
    { campaignId: campaign.id, sourceRowId: "2", businessName: "Northwind", decisionMaker: "Casey", email: "casey@northwind.com", renewalDate: new Date(Date.now()+1000*60*60*24*80), daysToRenew: 80, industry: "Retail", offerType: "continuity", notes: "out of window", processingStatus: ProcessingStatus.NEEDS_REVIEW },
    { campaignId: campaign.id, sourceRowId: "3", businessName: null, decisionMaker: null, email: "", renewalDate: null, daysToRenew: null, industry: "", offerType: "", notes: "", processingStatus: ProcessingStatus.NEEDS_REVIEW }
  ]});
}
main().finally(()=>prisma.$disconnect());
TS

cat > tests/validation.test.ts <<'TS'
import { describe, expect, it } from "vitest";
import { calculateDaysToRenew, classifyCampaignMode, detectBannedPhrases, validateRow } from "../src/utils/validation";
describe("validation", () => {
  it("calculates days to renew", () => { expect(calculateDaysToRenew(new Date("2026-05-10"), new Date("2026-05-01"))).toBe(9); });
  it("detects missing field", () => { const r = validateRow({ sourceRowId: "1" }); expect(r.missingFields).toContain("Renewal_Date"); });
  it("classifies acceleration window", () => { expect(classifyCampaignMode(20, "standard")).toBe("Renewal-Acceleration"); });
  it("classifies upsell mode", () => { expect(classifyCampaignMode(30, "cloud upgrade")).toBe("Renewal-Upsell"); });
  it("guardrail score below 9 not final", () => { const approved = 8 >= 9; expect(approved).toBe(false); });
  it("export approved only guardrail", () => { const rows = [{ finalOutputReady: true }, { finalOutputReady: false }]; expect(rows.filter(r=>r.finalOutputReady)).toHaveLength(1); });
  it("detects banned phrases", () => { expect(detectBannedPhrases("I hope this finds you well", ["I hope this finds you well"]).length).toBe(1); });
});
TS

cat > README.md <<'MD'
# VRF Campaign Orchestrator

## Prerequisites
- Node.js 20+
- npm 10+
- PostgreSQL

## Setup
1. npm install
2. cp .env.example .env
3. npx prisma db push
4. npx prisma db seed --schema prisma/schema.prisma
5. npm run dev
MD

echo "Done. Next: npm install && npm test && npm run dev"
