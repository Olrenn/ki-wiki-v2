/**
 * Single Source of Truth für alle Wiki-Kategorien.
 * Importiert in: Homepage, Topbar, WikiEntry, Connections, Kategorie-Seiten.
 * Eine Farbe oder ein Label hier ändern = überall automatisch aktualisiert.
 */

export interface Category {
  id: string;
  label: string;
  color: string;
  description: string;
  icon: string;
}

export const categories: Category[] = [
  { id: "tools",        label: "Tools & Software",         color: "#d35c2b", description: "AI-Tools von Chatbots bis Coding-Assistenten",   icon: "⚒" },
  { id: "modelle",      label: "Modelle & Architekturen",  color: "#e04e8a", description: "GPT, Claude, Llama, Transformer und mehr",       icon: "◈" },
  { id: "konzepte",     label: "Konzepte & Grundlagen",    color: "#8b5cf6", description: "Deep Learning, RAG, Fine-Tuning erklärt",        icon: "◉" },
  { id: "setups",       label: "Setups & Konfigurationen", color: "#2b8cd3", description: "Tool-Kombinationen Schritt für Schritt",         icon: "⚙" },
  { id: "unternehmen",  label: "Unternehmen",              color: "#0891b2", description: "OpenAI, Anthropic, DeepMind und andere",          icon: "▲" },
  { id: "geschichte",   label: "Geschichte",               color: "#78716c", description: "Von Turing bis ChatGPT",                         icon: "◷" },
  { id: "robotik",      label: "Robotik & Hardware",       color: "#64748b", description: "Roboter, GPUs, TPUs und Chips",                  icon: "⬡" },
  { id: "ethik",        label: "Ethik & Gesellschaft",     color: "#dc2626", description: "Safety, Regulierung, Bias, Arbeitswelt",         icon: "⚖" },
  { id: "anwendungen",  label: "Anwendungsgebiete",        color: "#16a34a", description: "Medizin, Fahren, Finanzen, Kreativität",         icon: "◧" },
  { id: "glossar",      label: "Glossar",                  color: "#059669", description: "Fachbegriffe von A bis Z",                       icon: "◬" },
];

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getCategoryColor(id: string): string {
  return getCategory(id)?.color ?? "#6b7280";
}

export function getCategoryLabel(id: string): string {
  return getCategory(id)?.label ?? id;
}
