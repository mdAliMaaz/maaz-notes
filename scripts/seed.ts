import { MongoClient } from "mongodb";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Load env files — .env.local overrides .env (Next.js convention)
function loadEnvFiles() {
  for (const name of [".env"]) {
    const envPath = path.join(process.cwd(), name);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (key) process.env[key] = val; // later file wins
    }
  }
}

loadEnvFiles();

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB ?? "maaz-notes";

const PROJECTS = [
  {
    title: "Trace Lens",
    description: "A lightweight CLI tool for collecting and visualising OpenTelemetry traces locally. Useful for understanding distributed request flows without standing up a full observability backend.",
    tags: ["Go", "OpenTelemetry", "CLI", "Observability"],
    github: "",
    live: "",
    status: "active",
    year: 2025,
  },
  {
    title: "Alloc Atlas",
    description: "An annotated study of memory allocator internals — starting from a naive bump allocator, through free-list variants, up to a simplified slab allocator. Written in C with detailed inline notes.",
    tags: ["C", "Systems", "Memory", "Low-Level"],
    github: "",
    live: "",
    status: "wip",
    year: 2025,
  },
  {
    title: "Math Canvas",
    description: "An interactive browser tool for plotting mathematical functions, vector fields, and parametric curves. Built to make real-analysis and linear-algebra intuitions visual.",
    tags: ["TypeScript", "Canvas API", "Mathematics"],
    github: "",
    live: "",
    status: "wip",
    year: 2024,
  },
  {
    title: "maaz-notes CLI",
    description: "A terminal companion to this site — create, search, and preview Markdown notes from the command line. Syncs with the content directory used by the Next.js build.",
    tags: ["Rust", "CLI", "Markdown"],
    github: "",
    live: "",
    status: "active",
    year: 2024,
  },
  {
    title: "eBPF Perf Sampler",
    description: "A proof-of-concept CPU profiler using eBPF to sample kernel and user-space stacks. Outputs folded stacks compatible with Flamegraph and Speedscope.",
    tags: ["C", "eBPF", "Linux", "Profiling"],
    github: "",
    live: "",
    status: "archived",
    year: 2023,
  },
];

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  console.log(`Connected to ${uri} (db: ${dbName})`);

  const db = client.db(dbName);

  // ── Vocabulary ──────────────────────────────────────────────────────────────
  const vocabPath = path.join(process.cwd(), "content", "vocabulary.md");
  if (fs.existsSync(vocabPath)) {
    const words = fs
      .readFileSync(vocabPath, "utf8")
      .replace(/<!--[\s\S]*?-->/g, "")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("- "))
      .map((l) => l.slice(2).split("|").map((p) => p.trim()))
      .filter((parts) => parts.length >= 3 && parts[0])
      .map(([word, definition, example, notes = ""]) => ({ word, definition, example, notes }));

    if (words.length > 0) {
      await db.collection("vocabulary").deleteMany({});
      await db.collection("vocabulary").insertMany(words);
      console.log(`  vocabulary: inserted ${words.length} words`);
    }
  } else {
    console.log("  vocabulary: content/vocabulary.md not found, skipping");
  }

  // ── Posts ───────────────────────────────────────────────────────────────────
  const postsDir = path.join(process.cwd(), "content", "posts");
  if (fs.existsSync(postsDir)) {
    const posts = fs
      .readdirSync(postsDir)
      .filter((f) => f.endsWith(".md"))
      .map((file) => {
        const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
        const { data, content } = matter(raw);
        return {
          slug: file.replace(/\.md$/, ""),
          title: String(data.title ?? file.replace(/\.md$/, "")),
          description: String(data.description ?? ""),
          date: String(data.date ?? ""),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          content: content.trim(),
        };
      });

    if (posts.length > 0) {
      await db.collection("posts").deleteMany({});
      await db.collection("posts").insertMany(posts);
      console.log(`  posts: inserted ${posts.length} posts`);
    }
  } else {
    console.log("  posts: content/posts/ not found, skipping");
  }

  // ── Projects ────────────────────────────────────────────────────────────────
  await db.collection("projects").deleteMany({});
  await db.collection("projects").insertMany(PROJECTS);
  console.log(`  projects: inserted ${PROJECTS.length} projects`);

  // ── Indexes ─────────────────────────────────────────────────────────────────
  await db.collection("posts").createIndex({ slug: 1 }, { unique: true });
  await db.collection("vocabulary").createIndex({ word: 1 }, { unique: true });
  console.log("  indexes: created unique indexes on posts.slug and vocabulary.word");

  await client.close();
  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
