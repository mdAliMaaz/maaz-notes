"use client";

import { useState } from "react";
import type { Word } from "@/lib/vocabulary";

export default function DailyFlashcards({ words }: { words: Word[] }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  if (words.length === 0) return null;
  const item = words[index];
  const isRevealed = revealed.has(item.word);

  function toggle() {
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(item.word)) next.delete(item.word);
      else next.add(item.word);
      return next;
    });
  }

  function go(delta: number) {
    setIndex((current) => (current + delta + words.length) % words.length);
  }

  return (
    <div className="flash-carousel">
      <article
        className={`flashcard flip-card${isRevealed ? " revealed" : ""}`}
        role="button"
        tabIndex={0}
        aria-pressed={isRevealed}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <div className="flip-card-inner">
          <div className="flip-card-face flip-card-front">
            <div className="meta">CARD {String(index + 1).padStart(2, "0")} / {String(words.length).padStart(2, "0")}</div>
            <div className="word">{item.word}</div>
            <div className="muted" style={{ marginTop: "auto", fontSize: 13 }}>Tap to reveal meaning</div>
          </div>
          <div className="flip-card-face flip-card-back">
            <div className="meta">CARD {String(index + 1).padStart(2, "0")} / {String(words.length).padStart(2, "0")}</div>
            <div className="word">{item.word}</div>
            <div className="definition">{item.definition}</div>
            <div className="example"><strong>Example:</strong> {item.example}</div>
            {item.notes && <div className="meta" style={{ marginTop: 12 }}>{item.notes}</div>}
          </div>
        </div>
      </article>
      <div className="carousel-controls">
        <button className="btn" type="button" onClick={() => go(-1)} aria-label="Previous word">← Prev</button>
        <div className="carousel-dots">
          {words.map((w, i) => (
            <span key={w.word} className={`carousel-dot${i === index ? " active" : ""}`} onClick={() => setIndex(i)} />
          ))}
        </div>
        <button className="btn" type="button" onClick={() => go(1)} aria-label="Next word">Next →</button>
      </div>
    </div>
  );
}
