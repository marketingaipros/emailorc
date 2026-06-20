export const QA_APPROVAL_THRESHOLD = 90;

export const APPROVER_ROLES = new Set(["SUPER_ADMIN", "CLIENT_ADMIN", "REVIEWER"]);

export type DraftApprovalInput = {
  userRole: unknown;
  draftId: unknown;
  qaScore: unknown;
  spamRisk: unknown;
  subjectLine1: unknown;
  subjectLine2: unknown;
};

export function normalizeApprovalRole(role: unknown) {
  return String(role || "").trim().toUpperCase().replace(/[\s-]+/g, "_");
}

export function validateDraftApproval(input: DraftApprovalInput) {
  const role = normalizeApprovalRole(input.userRole);
  const draftId = String(input.draftId || "");
  const qaScore = Number(input.qaScore || 0);
  const spamRisk = String(input.spamRisk || "");
  const subject1 = String(input.subjectLine1 || "").trim();
  const subject2 = String(input.subjectLine2 || "").trim();

  if (!draftId) return { error: "Draft missing required fields.", status: 400 };
  if (!APPROVER_ROLES.has(role)) return { error: "User does not have approval permission.", status: 403 };
  if (qaScore < QA_APPROVAL_THRESHOLD) return { error: "QA score below threshold.", status: 400 };
  if (!["Low", "Medium"].includes(spamRisk)) return { error: "Draft spam risk is too high.", status: 400 };
  if (!subject1 || !subject2) return { error: "Draft missing required fields.", status: 400 };
  if (subject1.toLowerCase() === subject2.toLowerCase()) return { error: "Duplicate subject lines.", status: 400 };

  return {
    status: 200,
    role,
    draftId,
    qaScore,
    spamRisk,
    subject1,
    subject2,
  };
}
