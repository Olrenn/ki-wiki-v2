#!/usr/bin/env tsx
import { orchestrate } from "../agents/orchestrator.js";
import { publishEntry } from "./publisher.js";

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const countIdx = args.indexOf("--count");
  const count = countIdx !== -1 ? parseInt(args[countIdx + 1], 10) || 1 : 1;
  const mode = process.env.ANTHROPIC_API_KEY ? "SDK" : "CLI";

  console.log("╔══════════════════════════════════════════╗");
  console.log("║     KI-Wiki — Content Pipeline            ║");
  console.log(`║  ${dryRun ? "DRY RUN" : "LIVE"} · ${count} Einträge · ${mode}             ║`);
  console.log("╚══════════════════════════════════════════╝");

  let published = 0, rejected = 0;

  for (let i = 0; i < count; i++) {
    try {
      const result = await orchestrate({ maxRevisionRounds: 2 });
      if (result.draft) { await publishEntry(result.draft, result.log, dryRun); published++; }
      else { rejected++; }
    } catch (err) { console.error(`\n❌ ${err}`); }
  }

  console.log(`\n══ Fertig: ${published} publiziert, ${rejected} abgelehnt ══`);
}

main().catch(console.error);
