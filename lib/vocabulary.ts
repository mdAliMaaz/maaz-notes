import { getDb } from "./db";

export type Word = {
  word: string;
  definition: string;
  example: string;
  notes: string;
};

export async function getVocabulary(): Promise<Word[]> {
  const db = await getDb();
  return db
    .collection<Word>("vocabulary")
    .find({}, { projection: { _id: 0 } })
    .sort({ word: 1 })
    .toArray();
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
