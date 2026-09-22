"use client";

import { useMemo, useState } from "react";
import Markdown from "@/components/markdown";

const starter = `---
title: "A New Note"
description: "A short description."
date: "2026-09-22"
tags: ["math", "cs"]
---

# A New Note

Write your idea here.

## Diagram

\`\`\`mermaid
graph LR
  A[Question] --> B[Idea]
  B --> C[Understanding]
\`\`\`

## Mathematics

The quadratic formula is

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$
`;

function frontmatter(markdown: string) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  const title = match?.[1].match(/title:\s*["']?(.+?)["']?$/m)?.[1]?.trim() ?? "Untitled";
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return { title, slug };
}

export default function Studio({ initialMarkdown, originalSlug }: { initialMarkdown?: string; originalSlug?: string }) {
  const [markdown, setMarkdown] = useState(initialMarkdown || starter);
  const [status, setStatus] = useState("");
  const meta = useMemo(() => frontmatter(markdown), [markdown]);
  const editing = Boolean(originalSlug);

  async function publish() {
    setStatus("Publishing…");
    const password = window.localStorage.getItem("studio-password") || window.prompt("Studio password (leave blank if not configured)") || "";
    if (password) window.localStorage.setItem("studio-password", password);
    const res = await fetch("/api/publish", { method: "POST", headers: { "Content-Type": "application/json", "x-studio-password": password }, body: JSON.stringify({ markdown, slug: meta.slug, originalSlug }) });
    const data = await res.json();
    setStatus(res.ok ? `${editing ? "Updated" : "Published"} ${data.slug}.md` : data.error || "Publish failed");
  }

  return <div className="studio"><div className="container">
    <div className="studio-header"><div className="eyebrow">Studio</div><h1>{editing ? "Edit note" : "Write & publish"}</h1><p className="muted">Markdown + Git-backed publishing. Use KaTeX for mathematics and Mermaid for diagrams.</p></div>
    <div className="studio-top"><div className="notice">{editing ? <>Editing <code>{originalSlug}.md</code>. Publishing updates the existing note.</> : <>Create a new Markdown note. Publishing commits it to your repository on Vercel.</>}</div><div className="notice">Tip: use <code>[[Concept]]</code> later for knowledge-graph links. For now, use tags to keep notes discoverable.</div></div>
    <div className="toolbar" style={{ marginBottom: 14 }}><button className="btn primary" onClick={publish}>{editing ? "Save changes" : "Publish note"}</button><button className="btn" onClick={() => setMarkdown(starter)}>New note</button><span className="muted" style={{ padding: "10px 2px", fontSize: 13 }}>{status}</span></div>
    <div className="editor-grid"><section className="panel"><div className="panel-head">Markdown editor <span className="muted">{meta.slug}.md</span></div><textarea className="editor" value={markdown} onChange={e => setMarkdown(e.target.value)} spellCheck={false} /></section>
      <section className="panel"><div className="panel-head">Live preview</div><div className="preview"><Markdown content={markdown.replace(/^---[\s\S]*?---\n?/, "")} /></div></section>
    </div>
  </div></div>;
}
