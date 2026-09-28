import { getDailyWords, getVocabulary } from "@/lib/vocabulary";
import VocabularyClient from "@/components/vocabulary-client";
import DailyFlashcards from "@/components/daily-flashcards";

export default function VocabularyPage() {
  const words = getVocabulary();
  const daily = getDailyWords(words);
  return <main className="flashcards"><div className="container">
    <div className="eyebrow">Vocabulary</div>
    <h1 style={{fontSize:56,marginBottom:12}}>Today&apos;s 10</h1>
    <p className="muted" style={{fontSize:18}}>A deterministic daily set generated from <code>content/vocabulary.md</code>. Click a card to reveal its meaning.</p>
    <DailyFlashcards words={daily} />
    <VocabularyClient words={words} />
  </div></main>;
}
