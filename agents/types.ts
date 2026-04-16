import { z } from "zod";

export const wikiCategoryEnum = z.enum([
  "tools", "modelle", "konzepte", "setups", "unternehmen",
  "geschichte", "robotik", "ethik", "anwendungen", "glossar",
]);

export type WikiCategory = z.infer<typeof wikiCategoryEnum>;

export const EntryProposalSchema = z.object({
  title: z.string(),
  slug: z.string(),
  category: wikiCategoryEnum,
  tags: z.array(z.string()).default([]),
  reasoning: z.string(),
  priority: z.preprocess(
    (val) => typeof val === "string" ? parseInt(val, 10) : val,
    z.number().min(1).max(10)
  ),
});

export const ResearchOutputSchema = z.object({
  proposals: z.array(EntryProposalSchema).min(1).max(10),
});

export type EntryProposal = z.infer<typeof EntryProposalSchema>;
export type ResearchOutput = z.infer<typeof ResearchOutputSchema>;

export const WikiEntryDraftSchema = z.object({
  title: z.string(),
  slug: z.string(),
  category: wikiCategoryEnum,
  tags: z.array(z.string()).default([]),
  description: z.string().max(200),
  content: z.string(),
  relatedEntries: z.array(z.object({
    title: z.string(),
    href: z.string(),
    category: z.string(),
    description: z.string().optional(),
  })).default([]),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    accessed: z.string().optional(),
  })).default([]),
});

export type WikiEntryDraft = z.infer<typeof WikiEntryDraftSchema>;

export const FactCheckReviewSchema = z.object({
  overallScore: z.preprocess(
    (val) => typeof val === "string" ? parseFloat(val) : val,
    z.number().min(1).max(10)
  ),
  factsCorrect: z.boolean(),
  issuesFound: z.array(z.string()).default([]),
  sourcesValid: z.boolean(),
  neutralTone: z.boolean(),
  suggestions: z.array(z.string()).default([]),
  missingInfo: z.array(z.string()).default([]),
});

export type FactCheckReview = z.infer<typeof FactCheckReviewSchema>;

export const CuratorDecisionSchema = z.object({
  decision: z.enum(["approve", "revise", "reject"]),
  reasoning: z.string(),
  revisionInstructions: z.string().nullish(),
  qualityScore: z.preprocess(
    (val) => typeof val === "string" ? parseFloat(val) : val,
    z.number().min(1).max(10)
  ),
});

export type CuratorDecision = z.infer<typeof CuratorDecisionSchema>;

export interface PipelineLogEntry {
  timestamp: string;
  title: string;
  slug: string;
  category: WikiCategory;
  factCheckScore: number;
  curatorDecision: string;
  curatorScore: number;
  revisionRounds: number;
  published: boolean;
  tokensUsed: number;
}
