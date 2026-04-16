import { callAgent } from "./client.js";
import { WikiEntryDraftSchema, type WikiEntryDraft, type EntryProposal } from "./types.js";

export async function writeEntry(
  proposal: EntryProposal,
  revisionInstructions?: string
): Promise<{ draft: WikiEntryDraft; tokensUsed: number }> {
  const msg = revisionInstructions
    ? `ÜBERARBEITUNG: ${proposal.category}/${proposal.title}\n\nAnweisungen:\n${revisionInstructions}\n\nNEU schreiben. NUR JSON.`
    : `Wiki-Eintrag schreiben:\n\nKategorie: ${proposal.category}\nTitel: ${proposal.title}\nSlug: ${proposal.slug}\nTags: ${proposal.tags.join(", ")}\nKontext: ${proposal.reasoning}\n\nNUR JSON.`;

  const { result, tokensUsed } = await callAgent({
    model: "sonnet",
    systemPrompt: "writer",
    userMessage: msg,
    schema: WikiEntryDraftSchema,
    maxTokens: 8192,
    temperature: 0.7,
  });

  return { draft: result, tokensUsed };
}
