import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

function cleanSlug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function auth(request: Request) {
  const configuredPassword = process.env.STUDIO_PASSWORD;
  if (configuredPassword && request.headers.get("x-studio-password") !== configuredPassword) return false;
  if (!configuredPassword && process.env.NODE_ENV === "production") return false;
  return true;
}

async function githubRequest(slug: string, method: string, body?: unknown) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !owner || !repo) return null;

  const api = `https://api.github.com/repos/${owner}/${repo}/contents/content/posts/${slug}.md`;
  const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  return fetch(`${api}${method === "GET" ? `?ref=${encodeURIComponent(branch)}` : ""}`, {
    method,
    headers: { ...headers, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

export async function POST(request: Request) {
  try {
    if (!auth(request)) return NextResponse.json({ error: "Studio password required." }, { status: 401 });
    const body = await request.json();
    const markdown = String(body.markdown || "");
    const slug = cleanSlug(String(body.slug || ""));
    const originalSlug = cleanSlug(String(body.originalSlug || slug));
    if (!markdown || !slug) return NextResponse.json({ error: "Markdown and slug are required." }, { status: 400 });

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      const filePath = path.join(process.cwd(), "content", "posts", `${slug}.md`);
      await fs.writeFile(filePath, markdown, "utf8");
      if (originalSlug !== slug) {
        await fs.rm(path.join(process.cwd(), "content", "posts", `${originalSlug}.md`), { force: true });
      }
      return NextResponse.json({ ok: true, slug, mode: "filesystem" });
    }

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";
    if (!owner || !repo) return NextResponse.json({ error: "GITHUB_OWNER and GITHUB_REPO are required." }, { status: 500 });

    const existing = await githubRequest(slug, "GET");
    let sha: string | undefined;
    if (existing?.ok) sha = (await existing.json()).sha;
    const encoded = Buffer.from(markdown, "utf8").toString("base64");
    const result = await githubRequest(slug, "PUT", {
      message: `${sha ? "update" : "feat"}: publish ${slug}`,
      content: encoded,
      branch,
      ...(sha ? { sha } : {}),
    });
    if (!result?.ok) return NextResponse.json({ error: "GitHub rejected the publish request.", detail: await result?.text() }, { status: result?.status || 500 });

    if (originalSlug !== slug) {
      const old = await githubRequest(originalSlug, "GET");
      if (old?.ok) {
        const oldData = await old.json();
        await githubRequest(originalSlug, "DELETE", { message: `chore: rename ${originalSlug} to ${slug}`, sha: oldData.sha, branch });
      }
    }

    return NextResponse.json({ ok: true, slug, mode: "github" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!auth(request)) return NextResponse.json({ error: "Studio password required." }, { status: 401 });
    const slug = cleanSlug(new URL(request.url).searchParams.get("slug") || "");
    if (!slug) return NextResponse.json({ error: "Slug is required." }, { status: 400 });

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      await fs.rm(path.join(process.cwd(), "content", "posts", `${slug}.md`), { force: true });
      return NextResponse.json({ ok: true, mode: "filesystem" });
    }

    const existing = await githubRequest(slug, "GET");
    if (!existing?.ok) return NextResponse.json({ error: "Post not found on GitHub." }, { status: existing?.status || 404 });
    const file = await existing.json();
    const result = await githubRequest(slug, "DELETE", { message: `delete: ${slug}`, sha: file.sha, branch: process.env.GITHUB_BRANCH || "main" });
    if (!result?.ok) return NextResponse.json({ error: "GitHub rejected the delete request.", detail: await result.text() }, { status: result.status });
    return NextResponse.json({ ok: true, mode: "github" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
