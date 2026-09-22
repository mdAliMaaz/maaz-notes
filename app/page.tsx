import Link from "next/link";
import { getPosts } from "@/lib/posts";

export default function Home() {
  const posts = getPosts().slice(0, 4);
  return <main>
    <div className="container">
      <section className="hero">
        <div className="eyebrow">Engineer · Learner · Builder</div>
        <h1>Ideas worth understanding deeply.</h1>
        <p>Notes on mathematics, computer science, systems, observability, books, and the questions that appear while learning.</p>
        <div className="hero-actions"><Link className="btn primary" href="/blog">Explore notes →</Link><Link className="btn" href="/studio">Write a note</Link></div>
      </section>
      <section className="section"><div className="section-head"><div><div className="eyebrow">Currently learning</div><h2 className="section-title">The things I am trying to understand</h2></div></div>
        <div className="topic-grid">{["Mathematics", "CS Internals", "Distributed Systems", "Observability", "Databases", "Books & Philosophy"].map((topic) => <div className="topic-card" key={topic}><span>{topic}</span><span className="topic-arrow">↗</span></div>)}</div>
      </section>
      <section className="section"><div className="section-head"><div><div className="eyebrow">Latest</div><h2 className="section-title">Recent writing</h2></div><Link className="muted" href="/blog">View all →</Link></div>
        <div className="post-grid">{posts.map((post) => <Link href={`/blog/${post.slug}`} className="card" key={post.slug}>
          <div className="meta"><span>{post.date}</span>{post.tags.slice(0, 2).map(tag => <span className="tag" key={tag}>{tag}</span>)}</div><h3>{post.title}</h3><p>{post.description}</p><span className="muted">Read note →</span>
        </Link>)}</div>
      </section>
      <section className="section"><div className="card feature-card"><div><div className="eyebrow">Daily practice</div><h2 className="section-title" style={{ marginTop: 8 }}>10 vocabulary flashcards every day.</h2><p className="muted">Words live in Markdown, while the site turns them into a small spaced-learning habit.</p></div><Link className="btn primary" href="/vocabulary">Study today →</Link></div></section>
    </div>
  </main>;
}
