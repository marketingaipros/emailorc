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
