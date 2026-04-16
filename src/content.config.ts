import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const wiki = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/wiki" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum([
      "tools", "modelle", "konzepte", "setups", "unternehmen",
      "geschichte", "robotik", "ethik", "anwendungen", "glossar",
    ]),
    tags: z.array(z.string()).default([]),
    confidence: z.enum(["verified", "draft"]).default("draft"),
    lastUpdated: z.string().optional(),
    historical: z.boolean().default(false),
  }),
});

export const collections = { wiki };
