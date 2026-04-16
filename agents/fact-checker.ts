import { callAgent } from "./client.js";
import { FactCheckReviewSchema, type FactCheckReview, type WikiEntryDraft } from "./types.js";

export async function factCheck(draft: WikiEntryDraft): Promise<{ review: FactCheckReview; tokensUsed: number }> {
  const { result, tokensUsed } = await callAgent({
    model: "sonnet",
    systemPrompt: "fact-checker",
    userMessage: `Prüfe:\n\nTITEL: ${draft.title}\nKATEGORIE: ${draft.category}\nQUELLEN:\n${draft.sources.map((s) => `- ${s.title}: ${s.url}`).join("\n")}\n\nCONTENT:\n${draft.content}\n\nNUR JSON.`,
    schema: FactCheckReviewSchema,
    temperature: 0.3,
  });

  return { review: result, tokensUsed };
}
