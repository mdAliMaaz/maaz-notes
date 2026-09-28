import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

function clean(value: unknown) {
  return String(value ?? "").replace(/[\r\n|]/g, " ").trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const word = clean(body.word);
    const definition = clean(body.definition);
    const example = clean(body.example);
    const notes = clean(body.notes);
    if (!word || !definition || !example) {
      return NextResponse.json({ error: "Word, definition and example are required." }, { status: 400 });
    }
    const db = await getDb();
    const exists = await db.collection("vocabulary").findOne({ word: { $regex: `^${escapeRegex(word)}$`, $options: "i" } });
    if (exists) return NextResponse.json({ error: "That word is already in the vocabulary." }, { status: 409 });
    await db.collection("vocabulary").insertOne({ word, definition, example, notes });
    return NextResponse.json({ ok: true, word });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const originalWord = clean(body.originalWord);
    const word = clean(body.word);
    const definition = clean(body.definition);
    const example = clean(body.example);
    const notes = clean(body.notes);
    if (!originalWord || !word || !definition || !example) {
      return NextResponse.json({ error: "Original word, word, definition and example are required." }, { status: 400 });
    }
    const db = await getDb();
    const result = await db.collection("vocabulary").updateOne(
      { word: { $regex: `^${escapeRegex(originalWord)}$`, $options: "i" } },
      { $set: { word, definition, example, notes } }
    );
    if (result.matchedCount === 0) return NextResponse.json({ error: "Word not found." }, { status: 404 });
    return NextResponse.json({ ok: true, word });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const word = clean(new URL(request.url).searchParams.get("word"));
    if (!word) return NextResponse.json({ error: "Word is required." }, { status: 400 });
    const db = await getDb();
    const result = await db.collection("vocabulary").deleteOne({ word: { $regex: `^${escapeRegex(word)}$`, $options: "i" } });
    if (result.deletedCount === 0) return NextResponse.json({ error: "Word not found." }, { status: 404 });
    return NextResponse.json({ ok: true, word });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
