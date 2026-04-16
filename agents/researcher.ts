import { callAgent } from "./client.js";
import { ResearchOutputSchema, type ResearchOutput } from "./types.js";
import { fetchLiveResearch } from "./web-research.js";
import { readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getExistingEntries(): string[] {
  const wikiDir = join(__dirname, "..", "src", "content", "wiki");
  try {
    return readdirSync(wikiDir)
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
      .map((f) => f.replace(/\.mdx?$/, ""));
  } catch { return []; }
}

export async function researchEntries(): Promise<{ output: ResearchOutput; tokensUsed: number }> {
  const existing = getExistingEntries();
  const liveData = await fetchLiveResearch();

  const { result, tokensUsed } = await callAgent({
    model: "haiku",
    systemPrompt: "researcher",
    userMessage: `Finde fehlende Wiki-Einträge.\n\n${liveData.rawData}\n\nBEREITS VORHANDEN:\n${existing.map((e) => `- ${e}`).join("\n")}\n\nSchlage 5-8 neue Einträge vor. Mische Kategorien.\nNUR JSON.`,
    schema: ResearchOutputSchema,
    temperature: 0.8,
  });

  return { output: result, tokensUsed };
}
