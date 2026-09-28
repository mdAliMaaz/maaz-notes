import { NextResponse } from "next/server";
import matter from "gray-matter";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

function cleanSlug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawMarkdown = String(body.markdown || "");
    const slug = cleanSlug(String(body.slug || ""));
    const originalSlug = cleanSlug(String(body.originalSlug || slug));
    if (!rawMarkdown || !slug) {
      return NextResponse.json({ error: "Markdown and slug are required." }, { status: 400 });
    }

    const { data, content } = matter(rawMarkdown);
    const post = {
      slug,
      title: String(data.title ?? slug),
      description: String(data.description ?? ""),
      date: String(data.date ?? new Date().toISOString().slice(0, 10)),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      content: content.trim(),
    };

    const db = await getDb();
    const existing = await db.collection("posts").findOne({ slug: originalSlug });
    if (existing) {
      await db.collection("posts").replaceOne({ slug: originalSlug }, post);
    } else {
      await db.collection("posts").insertOne(post);
    }

    return NextResponse.json({ ok: true, slug });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const slug = cleanSlug(new URL(request.url).searchParams.get("slug") || "");
    if (!slug) return NextResponse.json({ error: "Slug is required." }, { status: 400 });

    const db = await getDb();
    const result = await db.collection("posts").deleteOne({ slug });
    if (result.deletedCount === 0) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    return NextResponse.json({ ok: true, slug });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
