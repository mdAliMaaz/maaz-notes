"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Post } from "@/lib/posts";

export default function BlogList({ posts, manage = false }: { posts: Post[]; manage?: boolean }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [items, setItems] = useState(posts);
  const tags = useMemo(() => Array.from(new Set(items.flatMap((post) => post.tags))).sort(), [items]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((post) => {
      const matchesQuery = !q || `${post.title} ${post.description} ${post.tags.join(" ")} ${post.content}`.toLowerCase().includes(q);
      const matchesTag = tag === "all" || post.tags.includes(tag);
      return matchesQuery && matchesTag;
    });
  }, [items, query, tag]);

  async function remove(post: Post) {
    if (!confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    setBusy(post.slug);
    const password = localStorage.getItem("studio-password") || prompt("Studio password (leave blank if not configured)") || "";
    if (password) localStorage.setItem("studio-password", password);
    const res = await fetch(`/api/publish?slug=${encodeURIComponent(post.slug)}`, { method: "DELETE", headers: { "x-studio-password": password } });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) return alert(data.error || "Delete failed.");
    setItems((current) => current.filter((item) => item.slug !== post.slug));
  }

  return <>
    <div className="search-bar">
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes, concepts, tags…" aria-label="Search notes" />
      {tags.length > 0 && <select value={tag} onChange={(e) => setTag(e.target.value)} aria-label="Filter by topic">
        <option value="all">All topics</option>{tags.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>}
    </div>
    <div className="result-count">{filtered.length} {filtered.length === 1 ? "note" : "notes"}</div>
    <div className="post-grid">
      {filtered.map((post) => <article className="card" key={post.slug}>
        <Link href={`/blog/${post.slug}`}>
          <div className="meta"><span>{post.date}</span>{post.tags.map((item) => <span className="tag" key={item}>{item}</span>)}</div>
          <h3>{post.title}</h3><p>{post.description}</p><span className="muted">Read →</span>
        </Link>
        {manage && <div className="card-actions"><Link className="btn small" href={`/studio?edit=${encodeURIComponent(post.slug)}`}>Edit</Link><button className="btn small danger" onClick={() => remove(post)} disabled={busy === post.slug}>{busy === post.slug ? "Deleting…" : "Delete"}</button></div>}
      </article>)}
    </div>
    {filtered.length === 0 && <div className="empty">No notes match your search.</div>}
  </>;
}
