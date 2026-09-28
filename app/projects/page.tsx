import { getProjects, type Project } from "@/lib/projects";

function StatusBadge({ status }: { status: Project["status"] }) {
  const map = {
    active:   { color: "var(--green)",  label: "Active" },
    wip:      { color: "var(--amber)",  label: "In progress" },
    archived: { color: "var(--muted)",  label: "Archived" },
  };
  const { color, label } = map[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color, fontFamily: "var(--font-mono)" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

export default function ProjectsPage() {
  const projects = getProjects();
  return (
    <main className="blog-layout">
      <div className="container">
        <div className="eyebrow">Projects</div>
        <h1 style={{ fontSize: "clamp(40px, 7vw, 68px)", marginBottom: 12 }}>Things I&apos;ve built</h1>
        <p className="page-intro">Side projects, experiments, and studies — mostly in systems, math, and observability.</p>

        <div className="post-grid">
          {projects.map((project) => (
            <div className="card" key={project.title}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <StatusBadge status={project.status} />
                <span className="muted" style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}>{project.year}</span>
              </div>
              <h3 style={{ margin: "6px 0 8px" }}>{project.title}</h3>
              <p>{project.description}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {project.tags.map((tag) => (
                  <span className="tag" key={tag}>{tag}</span>
                ))}
              </div>
              {(project.github || project.live) && (
                <div className="card-actions">
                  {project.github && (
                    <a className="btn small" href={project.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
                  )}
                  {project.live && (
                    <a className="btn small" href={project.live} target="_blank" rel="noopener noreferrer">Live ↗</a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
