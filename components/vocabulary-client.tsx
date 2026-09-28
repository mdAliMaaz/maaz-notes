"use client";

import { useMemo, useRef, useState } from "react";
import type { Word } from "@/lib/vocabulary";

const emptyForm = { word: "", definition: "", example: "", notes: "" };
const PAGE_SIZE = 20;

export default function VocabularyClient({ words }: { words: Word[] }) {
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [items, setItems] = useState(words);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const formRef = useRef<HTMLElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? items.filter((w) => `${w.word} ${w.definition} ${w.example} ${w.notes}`.toLowerCase().includes(q))
      : items;
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleQueryChange(q: string) {
    setQuery(q);
    setPage(1);
  }

  function beginEdit(word: Word) {
    setEditing(word.word);
    setForm(word);
    setStatus("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() { setEditing(null); setForm(emptyForm); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Saving…");
    const password = localStorage.getItem("studio-password") || prompt("Studio password (leave blank if not configured)") || "";
    if (password) localStorage.setItem("studio-password", password);
    const res = await fetch("/api/vocabulary", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", "x-studio-password": password },
      body: JSON.stringify(editing ? { ...form, originalWord: editing } : form),
    });
    const data = await res.json();
    if (!res.ok) { setStatus(data.error || "Could not save word."); return; }
    setItems((cur) => editing ? cur.map((i) => i.word === editing ? form : i) : [...cur, form]);
    setStatus(editing ? `Updated "${form.word}".` : `Added "${form.word}".`);
    cancelEdit();
  }

  async function remove(word: Word) {
    if (!confirm(`Delete "${word.word}"? This cannot be undone.`)) return;
    const password = localStorage.getItem("studio-password") || prompt("Studio password (leave blank if not configured)") || "";
    if (password) localStorage.setItem("studio-password", password);
    const res = await fetch(`/api/vocabulary?word=${encodeURIComponent(word.word)}`, {
      method: "DELETE",
      headers: { "x-studio-password": password },
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Delete failed.");
    setItems((cur) => cur.filter((i) => i.word !== word.word));
    if (expanded === word.word) setExpanded(null);
  }

  return <>
    {/* Add / edit form */}
    <section ref={formRef} className="card" style={{ marginTop: 28, scrollMarginTop: 80 }}>
      <div className="section-head" style={{ marginBottom: 14 }}>
        <div>
          <div className="eyebrow">{editing ? "Edit word" : "Add a word"}</div>
          <h2 className="section-title">{editing ? `Editing ${editing}` : "Grow the vocabulary"}</h2>
        </div>
        <span className="muted" style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}>{items.length} words</span>
      </div>
      <form onSubmit={save}>
        <div className="studio-top">
          <div className="field"><label>Word</label><input required value={form.word} onChange={e => setForm({ ...form, word: e.target.value })} placeholder="e.g. judicious" /></div>
          <div className="field"><label>Definition</label><input required value={form.definition} onChange={e => setForm({ ...form, definition: e.target.value })} placeholder="clear, concise meaning" /></div>
          <div className="field"><label>Example</label><input required value={form.example} onChange={e => setForm({ ...form, example: e.target.value })} placeholder="Use the word in a sentence" /></div>
          <div className="field"><label>Notes (optional)</label><input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="part of speech / memory hook" /></div>
        </div>
        <button className="btn primary" type="submit">{editing ? "Save changes" : "Add word"}</button>
        {editing && <button className="btn" type="button" onClick={cancelEdit} style={{ marginLeft: 8 }}>Cancel</button>}
        <span className="muted" style={{ marginLeft: 12, fontSize: 13 }}>{status}</span>
      </form>
    </section>

    {/* Word table */}
    <section className="section" style={{ paddingBottom: 40 }}>
      <div className="section-head">
        <div>
          <div className="eyebrow">Library</div>
          <h2 className="section-title">Your words</h2>
        </div>
        <span className="muted" style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}>
          {filtered.length}{query.trim() ? ` of ${items.length}` : ""} words
        </span>
      </div>

      <div className="search-bar" style={{ marginBottom: 16 }}>
        <input value={query} onChange={e => handleQueryChange(e.target.value)} placeholder="Filter words…" aria-label="Search vocabulary" />
      </div>

      {filtered.length === 0 ? (
        <div className="empty">No words match &ldquo;{query}&rdquo;.</div>
      ) : (
        <>
          <div className="vocab-table">
            <div className="vocab-table-head">
              <span>Word</span>
              <span>Definition</span>
              <span className="vocab-col-notes">Notes</span>
              <span />
            </div>
            {paginated.map((word) => (
              <div key={word.word}>
                <div
                  className={`vocab-row${expanded === word.word ? " expanded" : ""}`}
                  onClick={() => setExpanded(expanded === word.word ? null : word.word)}
                >
                  <span className="vocab-word">{word.word}</span>
                  <span className="vocab-def">{word.definition}</span>
                  <span className="vocab-col-notes vocab-notes">{word.notes}</span>
                  <span className="vocab-actions" onClick={e => e.stopPropagation()}>
                    <button className="btn small" onClick={() => beginEdit(word)}>Edit</button>
                    <button className="btn small danger" onClick={() => remove(word)}>Delete</button>
                  </span>
                </div>
                {expanded === word.word && (
                  <div className="vocab-example">
                    <span className="vocab-example-label">Example</span>
                    {word.example}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="vocab-pagination">
              <button
                className="btn small"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Prev
              </button>
              <span className="vocab-page-info mono">
                {currentPage} / {totalPages}
                <span className="muted" style={{ marginLeft: 8 }}>({filtered.length} words)</span>
              </span>
              <button
                className="btn small"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  </>;
}
