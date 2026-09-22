import { getDailyWords, getVocabulary } from "@/lib/vocabulary";
import VocabularyClient from "@/components/vocabulary-client";

export default function VocabularyPage() {
  const words = getVocabulary();
  const daily = getDailyWords(words);
  return <main className="flashcards"><div className="container">
    <div className="eyebrow">Vocabulary</div>
    <h1 style={{fontSize:56,marginBottom:12}}>Today&apos;s 10</h1>
    <p className="muted" style={{fontSize:18}}>A deterministic daily set generated from <code>content/vocabulary.md</code>.</p>
    <div className="flash-grid">{daily.map((item, i) => <article className="flashcard" key={item.word}>
      <div className="meta">CARD {String(i+1).padStart(2,"0")}</div><div className="word">{item.word}</div><div className="definition">{item.definition}</div>
      <div className="example"><strong>Example:</strong> {item.example}</div>{item.notes && <div className="meta" style={{marginTop:12}}>{item.notes}</div>}
    </article>)}</div>
    <VocabularyClient words={words} />
  </div></main>;
}
