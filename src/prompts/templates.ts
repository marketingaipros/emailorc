export const PROMPTS = {
  sentinel: `Generate strategy JSON with Strategic_Angle, Core_Risk, Upsell_Bridge, Value_Outcome, CTA_Direction, Tone_Guidance, Red_Flags.`,
  scribe: `Generate email JSON: Subject_Line_1, Subject_Line_2, Preview_Text, Email_Body (90-180 words), CTA, Personalization_Used, Writer_Notes. Avoid banned phrases and hype.`,
  lexi: `QA score 1-10 and revise. Return JSON fields required by QAOutput schema.`,
  scribeRevision: `Revise SCRIBE draft per issues while preserving factual grounding only.`,
  sentinelRevision: `Revise strategy when relevance/offer framing issues are detected.`
};
