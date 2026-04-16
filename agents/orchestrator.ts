import { researchEntries } from "./researcher.js";
import { writeEntry } from "./writer.js";
import { factCheck } from "./fact-checker.js";
import { curate } from "./curator.js";
import type { EntryProposal, WikiEntryDraft, CuratorDecision, PipelineLogEntry } from "./types.js";

export interface OrchestratorResult {
  draft: WikiEntryDraft | null;
  decision: CuratorDecision;
  log: PipelineLogEntry;
}

export async function orchestrate(options: {
  maxRevisionRounds: number;
}): Promise<OrchestratorResult> {
  let totalTokens = 0;

  console.log("\n📡 Phase 1: Research...");
  const { output, tokensUsed: rTokens } = await researchEntries();
  totalTokens += rTokens;
  const queue = output.proposals;
  console.log(`  → ${queue.length} Vorschläge:`);
  queue.forEach((e, i) => console.log(`    ${i + 1}. [${e.category}] ${e.title}`));

  let lastDraft: WikiEntryDraft | null = null;
  let lastDecision: CuratorDecision | null = null;
  let lastEntry = queue[0];
  let lastRounds = 0;
  let lastScore = 0;

  for (let idx = 0; idx < queue.length; idx++) {
    const entry = queue[idx];
    lastEntry = entry;

    console.log(`\n═══ ${idx + 1}/${queue.length}: [${entry.category}] "${entry.title}" ═══`);

    console.log("\n✍️  Writing...");
    let { draft, tokensUsed: wTokens } = await writeEntry(entry);
    totalTokens += wTokens;
    lastDraft = draft;
    console.log(`  → ${draft.content.split(/\s+/).length} Wörter, ${draft.sources.length} Quellen`);

    let round = 0;
    let approved = false;
    let rejected = false;

    while (true) {
      round++;
      lastRounds = round;

      console.log(`\n🔍 Fact-Check (Runde ${round})...`);
      const { review, tokensUsed: fcT } = await factCheck(draft);
      totalTokens += fcT;
      lastScore = review.overallScore;
      console.log(`  → Score: ${review.overallScore}/10 | Fakten: ${review.factsCorrect ? "OK" : "FEHLER"}`);

      console.log("\n⚖️  Curator...");
      const { decision, tokensUsed: cT } = await curate({ draft, factCheck: review, revisionRound: round });
      totalTokens += cT;
      lastDecision = decision;
      console.log(`  → ${decision.decision.toUpperCase()} (${decision.qualityScore}/10)`);

      if (decision.decision === "approve") { approved = true; break; }
      if (decision.decision === "reject") { rejected = true; break; }

      if (round >= options.maxRevisionRounds) {
        if (decision.qualityScore >= 6) { lastDecision = { ...decision, decision: "approve" }; approved = true; }
        else { lastDecision = { ...decision, decision: "reject" }; rejected = true; }
        break;
      }

      console.log(`\n🔄 Revision: ${decision.revisionInstructions}`);
      const { draft: rev, tokensUsed: revT } = await writeEntry(entry, decision.revisionInstructions ?? "");
      totalTokens += revT;
      draft = rev;
      lastDraft = draft;
    }

    if (approved) break;
    if (rejected && idx < queue.length - 1) { console.log("  → Nächstes Topic..."); continue; }
  }

  return {
    draft: lastDecision?.decision === "approve" ? lastDraft : null,
    decision: lastDecision!,
    log: {
      timestamp: new Date().toISOString(),
      title: lastEntry.title,
      slug: lastEntry.slug,
      category: lastEntry.category,
      factCheckScore: lastScore,
      curatorDecision: lastDecision?.decision ?? "reject",
      curatorScore: lastDecision?.qualityScore ?? 0,
      revisionRounds: lastRounds,
      published: lastDecision?.decision === "approve",
      tokensUsed: totalTokens,
    },
  };
}
