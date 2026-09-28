import Link from "next/link";

const stack = ["C", "C++", "Rust", "Go", "Java", "Python", "Linux", "eBPF", "OpenTelemetry", "Git"];

const exploring = ["Real analysis", "Compiler internals", "Memory allocators", "Distributed tracing"];

export default function AboutPage() {
  return (
    <main className="blog-layout">
      <div className="container">

        <section className="hero" style={{ paddingBottom: 48 }}>
          <div className="eyebrow">About</div>
          <h1 style={{ fontSize: "clamp(42px, 7vw, 72px)" }}>
            Engineer.<br />Learner.<br />Builder.
          </h1>
          <p className="hero-desc">
            I&apos;m an engineer at Dynatrace, where I work on observability tooling that helps teams understand complex distributed systems.
            Outside work I spend time studying mathematics, poking at compilers, and writing notes on things I&apos;m trying to understand deeply.
          </p>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <div>
              <div className="eyebrow">Now</div>
              <h2 className="section-title">Currently</h2>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: 10 }}>Working on</div>
              <p style={{ margin: 0, color: "var(--text-dim)", lineHeight: 1.7 }}>
                The Dynatrace observability platform — building and maintaining systems that ingest, correlate, and surface signals at scale.
              </p>
            </div>
            <div className="card">
              <div className="eyebrow" style={{ marginBottom: 10 }}>Exploring</div>
              <ul style={{ margin: 0, padding: "0 0 0 18px", color: "var(--text-dim)", lineHeight: 2 }}>
                {exploring.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <div className="eyebrow">Toolbox</div>
              <h2 className="section-title">Stack &amp; tools</h2>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {stack.map((item) => (
              <span className="tag" key={item} style={{ fontSize: 13, padding: "6px 12px" }}>{item}</span>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <div className="eyebrow">Contact</div>
              <h2 className="section-title">Get in touch</h2>
            </div>
          </div>
          <div className="card" style={{ maxWidth: 520 }}>
            <p style={{ margin: "0 0 20px", color: "var(--text-dim)", lineHeight: 1.7 }}>
              This site is the best place to follow my writing. For everything else, GitHub is where most of my work lives.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Link className="btn primary" href="#">GitHub</Link>
              <Link className="btn" href="/blog">Read the notes</Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
