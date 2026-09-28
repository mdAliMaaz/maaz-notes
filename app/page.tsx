import Link from "next/link";
import { getPosts } from "@/lib/posts";

const topics = [
  { label: "Mathematics", icon: "∑" },
  { label: "CS Internals",  icon: "λ" },
  { label: "Distributed Systems", icon: "⊗" },
  { label: "Observability", icon: "◎" },
  { label: "Low-Level Systems", icon: "⚙" },
  { label: "Books & Philosophy", icon: "◈" },
];

export default async function Home() {
  const posts = (await getPosts()).slice(0, 4);
  return (
    <main style={{ flex: 1 }}>
      <div className="container">

        {/* Hero */}
        <section className="hero">
          <div className="hero-terminal">
            <span className="hero-terminal-dot" />
            <span className="hero-terminal-text mono">
              <span className="accent">maaz</span>@dynatrace:~$ ./init --mode=learn
            </span>
          </div>
          <h1>Ideas worth<br />understanding<br />deeply.</h1>
          <p className="hero-desc">
            Notes on mathematics, computer science, low-level systems, and observability —
            questions that appear while building things at{" "}
            <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "0.9em" }}>Dynatrace</span>.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" href="/blog">Explore notes →</Link>
            <Link className="btn" href="/studio">Open studio</Link>
          </div>
        </section>

        {/* Topics */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <div>
              <div className="eyebrow">Currently exploring</div>
              <h2 className="section-title">Areas of study</h2>
            </div>
          </div>
          <div className="topic-grid">
            {topics.map((t) => (
              <div className="topic-card" key={t.label}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontSize: 16, lineHeight: 1 }}>{t.icon}</span>
                  {t.label}
                </span>
                <span className="topic-arrow">↗</span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent writing */}
        {posts.length > 0 && (
          <section className="section">
            <div className="section-head">
              <div>
                <div className="eyebrow">Latest</div>
                <h2 className="section-title">Recent writing</h2>
              </div>
              <Link className="muted" href="/blog" style={{ fontSize: 13, fontFamily: "var(--font-mono)" }}>View all →</Link>
            </div>
            <div className="post-grid">
              {posts.map((post) => (
                <Link href={`/blog/${post.slug}`} className="card" key={post.slug}>
                  <div className="meta">
                    <span>{post.date}</span>
                    {post.tags.slice(0, 2).map(tag => <span className="tag" key={tag}>{tag}</span>)}
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                  <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>read note →</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Vocabulary CTA */}
        <section className="section">
          <div className="feature-card">
            <div>
              <div className="eyebrow">Daily practice</div>
              <h2 className="section-title" style={{ marginTop: 8 }}>10 vocabulary flashcards every day.</h2>
              <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
                Words live in MongoDB. The site turns them into a spaced-learning habit.
              </p>
            </div>
            <Link className="btn primary" href="/vocabulary">Study today →</Link>
          </div>
        </section>

      </div>
    </main>
  );
}
