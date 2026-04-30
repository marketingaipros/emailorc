export type CampaignMode = "Renewal-Upsell" | "Renewal-Protection" | "Renewal-Acceleration" | "Renewal-Reactivation" | "Unknown";
export type ValidationFlag = "Needs Review" | "Out of Window" | "Insufficient Personalization" | "Missing Critical Data";
export type RowInput = { sourceRowId: string; businessName?: string; decisionMaker?: string; email?: string; renewalDate?: string; daysToRenew?: number | null; industry?: string; offerType?: string; notes?: string; };
