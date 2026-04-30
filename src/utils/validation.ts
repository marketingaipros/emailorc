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
