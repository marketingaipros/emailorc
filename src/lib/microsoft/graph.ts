export const MICROSOFT_GRAPH_CREATE_DRAFT_ENDPOINT = "https://graph.microsoft.com/v1.0/me/messages";
export const MICROSOFT_GRAPH_ALLOWED_ENDPOINTS = new Set([MICROSOFT_GRAPH_CREATE_DRAFT_ENDPOINT]);

export type OutlookDraftInput = {
  recipientEmail: string;
  recipientName?: string | null;
  subject: string;
  body: string;
};

export function validateOutlookDraftInput(input: OutlookDraftInput) {
  const recipient = input.recipientEmail.trim();
  const subject = input.subject.trim();
  const body = input.body.trim();

  if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    return { error: "Valid recipient email is required.", status: 400 };
  }
  if (!subject) return { error: "Subject is required.", status: 400 };
  if (!body) return { error: "Email body is required.", status: 400 };
  return null;
}

export function buildOutlookDraftPayload(input: OutlookDraftInput) {
  const validation = validateOutlookDraftInput(input);
  if (validation) throw new Error(validation.error);

  return {
    subject: input.subject.trim(),
    body: {
      contentType: "Text",
      content: input.body.trim(),
    },
    toRecipients: [
      {
        emailAddress: {
          address: input.recipientEmail.trim(),
          name: String(input.recipientName || "").trim() || undefined,
        },
      },
    ],
  };
}

export async function postMicrosoftGraphDraft(params: {
  accessToken: string;
  draft: OutlookDraftInput;
  endpoint?: string;
  fetchImpl?: typeof fetch;
}) {
  const endpoint = params.endpoint || MICROSOFT_GRAPH_CREATE_DRAFT_ENDPOINT;
  if (!MICROSOFT_GRAPH_ALLOWED_ENDPOINTS.has(endpoint) || /\/send(?:Mail)?(?:\/)?$/i.test(endpoint)) {
    throw new Error("graph_endpoint_not_allowed");
  }

  const response = await (params.fetchImpl || fetch)(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildOutlookDraftPayload(params.draft)),
    cache: "no-store",
  });

  const data: any = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`graph_create_draft_failed:${response.status}`);
  return {
    id: String(data.id || ""),
    webLink: typeof data.webLink === "string" ? data.webLink : null,
  };
}
