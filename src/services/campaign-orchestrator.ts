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
