import fs from "node:fs";
import path from "node:path";

export type Word = {
  word: string;
  definition: string;
  example: string;
  notes: string;
};

const vocabularyPath = path.join(process.cwd(), "content", "vocabulary.md");

export function getVocabulary(): Word[] {
  if (!fs.existsSync(vocabularyPath)) return [];
  return fs
    .readFileSync(vocabularyPath, "utf8")
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).split("|").map((part) => part.trim()))
    .filter((parts) => parts.length >= 3 && parts[0])
    .map(([word, definition, example, notes = ""]) => ({ word, definition, example, notes }));
}

export function getDailyWords(words: Word[], date = new Date()): Word[] {
  if (words.length <= 10) return words;
  const key = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
  let seed = 0;
  for (const char of key) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;

  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (1664525 * seed + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 10);
}
