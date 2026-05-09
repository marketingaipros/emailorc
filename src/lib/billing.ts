export const PLAN_CREDITS: Record<string, number> = {
  Trial: 100,
  Starter: 500,
  Growth: 2500,
  Pro: 10000,
  Enterprise: 10000,
};

export function planIdForName(planName: string) {
  return `plan_${String(planName || "Trial").toLowerCase()}`;
}

export function estimateEmailsRemaining(creditsRemaining: number) {
  return Math.max(0, Math.floor(Number(creditsRemaining || 0) / 10));
}

export function trialEndDate(days = 14) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export function daysRemaining(date?: string | null) {
  if (!date) return null;
  const end = new Date(date).getTime();
  if (!Number.isFinite(end)) return null;
  return Math.max(0, Math.ceil((end - Date.now()) / 86400000));
}
