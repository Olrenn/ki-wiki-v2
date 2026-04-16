import { writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import type { WikiEntryDraft, PipelineLogEntry } from "../agents/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

export async function publishEntry(draft: WikiEntryDraft, log: PipelineLogEntry, dryRun: boolean): Promise<void> {
  console.log("\n📦 Publishing...");

  const mdx = buildMDX(draft);
  const filePath = join(rootDir, "src", "content", "wiki", `${draft.slug}.mdx`);

  if (dryRun) {
    console.log(`\n  🏜️  DRY RUN — ${filePath}`);
    console.log(`  📊 ${draft.content.split(/\s+/).length} Wörter, ${draft.sources.length} Quellen`);
    console.log(`\n  📄 Anfang:\n  ${mdx.substring(0, 500).replace(/\n/g, "\n  ")}`);
    return;
  }

  writeFileSync(filePath, mdx, "utf-8");
  console.log(`  ✅ ${filePath}`);

  // Log
  const logPath = join(rootDir, "data", "pipeline-log.json");
  let data: { runs: PipelineLogEntry[] } = { runs: [] };
  if (existsSync(logPath)) data = JSON.parse(readFileSync(logPath, "utf-8"));
  data.runs.push(log);
  writeFileSync(logPath, JSON.stringify(data, null, 2), "utf-8");

  // Git
  try {
    execSync(`cd "${rootDir}" && git add -A && git commit -m "wiki: ${draft.category}/${draft.slug} [draft]" && git push`, { stdio: "pipe" });
    console.log("  ✅ Pushed");
  } catch { console.log("  ⚠️  Git push fehlgeschlagen"); }
}

function buildMDX(draft: WikiEntryDraft): string {
  const tags = draft.tags.length > 0 ? `\ntags: [${draft.tags.map((t) => `"${t}"`).join(", ")}]` : "";

  const fm = `---
title: "${draft.title.replace(/"/g, '\\"')}"
description: "${draft.description.replace(/"/g, '\\"')}"
category: ${draft.category}${tags}
confidence: "draft"
lastUpdated: "${new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" })}"
---\n`;

  const imports: string[] = [];
  if (draft.relatedEntries.length > 0) imports.push("import Connections from '../../components/Connections.astro';");
  if (draft.sources.length > 0) imports.push("import Sources from '../../components/Sources.astro';");

  const components: string[] = [];
  if (draft.relatedEntries.length > 0) {
    components.push(`\n<Connections entries={${JSON.stringify(draft.relatedEntries)}} />`);
  }
  if (draft.sources.length > 0) {
    components.push(`\n<Sources list={${JSON.stringify(draft.sources)}} />`);
  }

  return `${fm}\n${imports.join("\n")}\n\n${draft.content}\n${components.join("\n")}\n`;
}
