import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

function clean(value: unknown) { return String(value ?? "").replace(/[\r\n|]/g, " ").trim(); }
function auth(request: Request) {
  const configuredPassword = process.env.STUDIO_PASSWORD;
  if (configuredPassword && request.headers.get("x-studio-password") !== configuredPassword) return false;
  if (!configuredPassword && process.env.NODE_ENV === "production") return false;
  return true;
}
function line(word: string, definition: string, example: string, notes: string) {
  return `- ${word} | ${definition} | ${example} | ${notes}`;
}

export async function POST(request: Request) {
  try {
    if (!auth(request)) return NextResponse.json({ error: "Studio password required." }, { status: 401 });
    const body = await request.json();
    const word = clean(body.word), definition = clean(body.definition), example = clean(body.example), notes = clean(body.notes);
    if (!word || !definition || !example) return NextResponse.json({ error: "Word, definition and example are required." }, { status: 400 });
    return await mutateVocabulary(request, "add", { word, definition, example, notes });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!auth(request)) return NextResponse.json({ error: "Studio password required." }, { status: 401 });
    const body = await request.json();
    const originalWord = clean(body.originalWord);
    const word = clean(body.word), definition = clean(body.definition), example = clean(body.example), notes = clean(body.notes);
    if (!originalWord || !word || !definition || !example) return NextResponse.json({ error: "Original word, word, definition and example are required." }, { status: 400 });
    return await mutateVocabulary(request, "update", { originalWord, word, definition, example, notes });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!auth(request)) return NextResponse.json({ error: "Studio password required." }, { status: 401 });
    const word = clean(new URL(request.url).searchParams.get("word"));
    if (!word) return NextResponse.json({ error: "Word is required." }, { status: 400 });
    return await mutateVocabulary(request, "delete", { word });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

async function mutateVocabulary(request: Request, operation: "add" | "update" | "delete", data: Record<string, string>) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token) {
    const filePath = path.join(process.cwd(), "content", "vocabulary.md");
    const current = await fs.readFile(filePath, "utf8");
    const lines = current.split("\n");
    const index = lines.findIndex((l) => l.trim().toLowerCase().startsWith(`- ${(data.originalWord || data.word || data.word).toLowerCase()} |`) || (operation === "delete" && l.trim().toLowerCase().startsWith(`- ${data.word.toLowerCase()} |`)));
    if (operation === "add") {
      if (index >= 0) return NextResponse.json({ error: "That word is already in the vocabulary." }, { status: 409 });
      lines.push(line(data.word, data.definition, data.example, data.notes));
    } else {
      if (index < 0) return NextResponse.json({ error: "Word not found." }, { status: 404 });
      if (operation === "delete") lines.splice(index, 1);
      else lines[index] = line(data.word, data.definition, data.example, data.notes);
    }
    await fs.writeFile(filePath, lines.join("\n"), "utf8");
    return NextResponse.json({ ok: true, word: data.word || data.originalWord, mode: "filesystem" });
  }

  if (!owner || !repo) return NextResponse.json({ error: "GITHUB_OWNER and GITHUB_REPO are required." }, { status: 500 });
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/content/vocabulary.md`;
  const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  const existing = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, { headers });
  if (!existing.ok) return NextResponse.json({ error: "Could not read vocabulary.md from GitHub." }, { status: existing.status });
  const file = await existing.json();
  const current = Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8");
  const lines = current.split("\n");
  const lookup = (operation === "add" ? data.word : data.originalWord || data.word).toLowerCase();
  const index = lines.findIndex((l: string) => l.trim().toLowerCase().startsWith(`- ${lookup} |`));

  if (operation === "add") {
    if (index >= 0) return NextResponse.json({ error: "That word is already in the vocabulary." }, { status: 409 });
    lines.push(line(data.word, data.definition, data.example, data.notes));
  } else {
    if (index < 0) return NextResponse.json({ error: "Word not found." }, { status: 404 });
    if (operation === "delete") lines.splice(index, 1);
    else lines[index] = line(data.word, data.definition, data.example, data.notes);
  }

  const result = await fetch(api, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ message: `${operation}: vocabulary ${data.word || data.originalWord}`, content: Buffer.from(lines.join("\n")).toString("base64"), branch, sha: file.sha }),
  });
  if (!result.ok) return NextResponse.json({ error: "GitHub rejected the vocabulary update.", detail: await result.text() }, { status: result.status });
  return NextResponse.json({ ok: true, word: data.word || data.originalWord, mode: "github" });
}
