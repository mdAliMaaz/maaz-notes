"use client";

import { useMemo, useState } from "react";
import type { Word } from "@/lib/vocabulary";

const emptyForm = { word: "", definition: "", example: "", notes: "" };

export default function VocabularyClient({ words }: { words: Word[] }) {
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(words);
  const [status, setStatus] = useState("");
  const filtered = useMemo(() => items.filter((word) => `${word.word} ${word.definition} ${word.example} ${word.notes}`.toLowerCase().includes(query.toLowerCase())), [items, query]);

  function beginEdit(word: Word) {
    setEditing(word.word);
    setForm(word);
    setStatus("");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function cancelEdit() { setEditing(null); setForm(emptyForm); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Saving…");
    const password = localStorage.getItem("studio-password") || prompt("Studio password (leave blank if not configured)") || "";
    if (password) localStorage.setItem("studio-password", password);
    const res = await fetch("/api/vocabulary", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json", "x-studio-password": password }, body: JSON.stringify(editing ? { ...form, originalWord: editing } : form) });
    const data = await res.json();
    if (!res.ok) { setStatus(data.error || "Could not save word."); return; }
    setItems((current) => editing ? current.map((item) => item.word === editing ? form : item) : [...current, form]);
    setStatus(editing ? `Updated “${form.word}”.` : `Added “${form.word}”.`);
    cancelEdit();
  }

  async function remove(word: Word) {
    if (!confirm(`Delete “${word.word}”? This cannot be undone.`)) return;
    const password = localStorage.getItem("studio-password") || prompt("Studio password (leave blank if not configured)") || "";
    if (password) localStorage.setItem("studio-password", password);
    const res = await fetch(`/api/vocabulary?word=${encodeURIComponent(word.word)}`, { method: "DELETE", headers: { "x-studio-password": password } });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Delete failed.");
    setItems((current) => current.filter((item) => item.word !== word.word));
  }

  return <>
    <section className="card" style={{ marginTop: 28 }}>
      <div className="section-head" style={{ marginBottom: 14 }}><div><div className="eyebrow">{editing ? "Edit word" : "Add a word"}</div><h2 className="section-title">{editing ? `Editing ${editing}` : "Grow the vocabulary"}</h2></div><span className="muted" style={{ fontSize: 13 }}>{items.length} words</span></div>
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
    <section className="section" style={{ paddingBottom: 20 }}>
      <div className="section-head"><div><div className="eyebrow">Library</div><h2 className="section-title">Your words</h2></div><span className="muted" style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}>{items.length} words</span></div>
      <div className="search-bar"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your vocabulary…" aria-label="Search vocabulary" /></div>
      {query.trim() && (
        filtered.length > 0
          ? <div className="post-grid">{filtered.map(word => <article className="card" key={word.word}><h3 style={{ marginTop: 0 }}>{word.word}</h3><p>{word.definition}</p><div className="example">{word.example}</div>{word.notes && <div className="meta" style={{ marginTop: 12 }}>{word.notes}</div>}<div className="card-actions"><button className="btn small" onClick={() => beginEdit(word)}>Edit</button><button className="btn small danger" onClick={() => remove(word)}>Delete</button></div></article>)}</div>
          : <div className="empty">No words match &ldquo;{query}&rdquo;.</div>
      )}
    </section>
  </>;
}
