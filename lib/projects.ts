export interface Project {
  title: string;
  description: string;
  tags: string[];
  github?: string;
  live?: string;
  status: "active" | "wip" | "archived";
  year: number;
}

export function getProjects(): Project[] {
  return [
    {
      title: "Trace Lens",
      description:
        "A lightweight CLI tool for collecting and visualising OpenTelemetry traces locally. Useful for understanding distributed request flows without standing up a full observability backend.",
      tags: ["Go", "OpenTelemetry", "CLI", "Observability"],
      github: "",
      live: "",
      status: "active",
      year: 2025,
    },
    {
      title: "Alloc Atlas",
      description:
        "An annotated study of memory allocator internals — starting from a naive bump allocator, through free-list variants, up to a simplified slab allocator. Written in C with detailed inline notes.",
      tags: ["C", "Systems", "Memory", "Low-Level"],
      github: "",
      live: "",
      status: "wip",
      year: 2025,
    },
    {
      title: "Math Canvas",
      description:
        "An interactive browser tool for plotting mathematical functions, vector fields, and parametric curves. Built to make real-analysis and linear-algebra intuitions visual.",
      tags: ["TypeScript", "Canvas API", "Mathematics"],
      github: "",
      live: "",
      status: "wip",
      year: 2024,
    },
    {
      title: "maaz-notes CLI",
      description:
        "A terminal companion to this site — create, search, and preview Markdown notes from the command line. Syncs with the content directory used by the Next.js build.",
      tags: ["Rust", "CLI", "Markdown"],
      github: "",
      live: "",
      status: "active",
      year: 2024,
    },
    {
      title: "eBPF Perf Sampler",
      description:
        "A proof-of-concept CPU profiler using eBPF to sample kernel and user-space stacks. Outputs folded stacks compatible with Flamegraph and Speedscope.",
      tags: ["C", "eBPF", "Linux", "Profiling"],
      github: "",
      live: "",
      status: "archived",
      year: 2023,
    },
  ];
}
