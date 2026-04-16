import { callAgent } from "./client.js";
import { CuratorDecisionSchema, type CuratorDecision, type WikiEntryDraft, type FactCheckReview } from "./types.js";

export async function curate(input: {
  draft: WikiEntryDraft;
  factCheck: FactCheckReview;
  revisionRound: number;
}): Promise<{ decision: CuratorDecision; tokensUsed: number }> {
  const { draft, factCheck: fc, revisionRound } = input;

  const { result, tokensUsed } = await callAgent({
    model: "sonnet",
    systemPrompt: "curator",
    userMessage: `Runde ${revisionRound}/2\n\nTitel: ${draft.title} | Kategorie: ${draft.category} | Wörter: ~${draft.content.split(/\s+/).length} | Quellen: ${draft.sources.length}\n\nFACT-CHECK (Score: ${fc.overallScore}/10):\nFakten: ${fc.factsCorrect ? "OK" : "FEHLER"} | Neutral: ${fc.neutralTone ? "OK" : "NEIN"}\nProbleme: ${fc.issuesFound.join("; ") || "Keine"}\nFehlend: ${fc.missingInfo.join("; ") || "Nichts"}\n\n${revisionRound >= 2 ? "LETZTE RUNDE — APPROVE oder REJECT." : ""}\n\nNUR JSON.`,
    schema: CuratorDecisionSchema,
    temperature: 0.4,
  });

  return { decision: result, tokensUsed };
}
