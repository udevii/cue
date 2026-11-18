import { NextResponse } from "next/server";
import { CATALOG } from "../../../src/data/catalog";
import { buildPrompt, localDiscover, parseModelResponse } from "../../../src/lib/discover";
import type { DiscoverRequest } from "../../../src/types";

const API = "https://api.anthropic.com/v1";
const HEADERS = (key: string) => ({ "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" });

// use AI_MODEL if it's set, otherwise pick the newest small model from the models list
let cachedModel: string | null = null;
async function pickModel(key: string): Promise<string> {
  if (process.env.AI_MODEL) return process.env.AI_MODEL;
  if (cachedModel) return cachedModel;
  const res = await fetch(`${API}/models?limit=50`, { headers: HEADERS(key), signal: AbortSignal.timeout(8_000) });
  if (!res.ok) throw new Error(`Models list returned ${res.status}`);
  const { data } = (await res.json()) as { data: Array<{ id: string }> };
  cachedModel = (data.find((m) => m.id.includes("haiku")) ?? data[0]).id;
  return cachedModel;
}

// tells the client if AI is set up
export function GET() {
  return NextResponse.json({ mode: process.env.AI_API_KEY ? "ai" : "offline" });
}

// POST { query, removed } -> recommendations
// the key stays on the server, and the answer gets checked against the catalog
// so it can't recommend a title that doesn't exist
export async function POST(req: Request) {
  let body: DiscoverRequest;
  try {
    const raw = (await req.json()) as Partial<DiscoverRequest>;
    body = { query: String(raw.query ?? "").slice(0, 300), removed: Array.isArray(raw.removed) ? raw.removed.map(String).slice(0, 10) : [] };
  } catch {
    return NextResponse.json({ error: "Send JSON with a query string." }, { status: 400 });
  }
  if (!body.query.trim()) return NextResponse.json({ error: "Query is empty." }, { status: 400 });

  const key = process.env.AI_API_KEY;
  if (!key) return NextResponse.json(localDiscover(body, CATALOG));

  try {
    const res = await fetch(`${API}/messages`, {
      method: "POST",
      headers: HEADERS(key),
      body: JSON.stringify({
        model: await pickModel(key),
        max_tokens: 900,
        messages: [{ role: "user", content: buildPrompt(body, CATALOG) }],
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`Model returned ${res.status}`);
    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = data.content?.filter((c) => c.type === "text").map((c) => c.text).join("") ?? "";
    const parsed = parseModelResponse(text, CATALOG);
    if (parsed) return NextResponse.json(parsed);
    throw new Error("Model answer wasn't valid JSON");
  } catch {
    return NextResponse.json({ ...localDiscover(body, CATALOG), note: "The AI didn't answer, so these are offline matches." });
  }
}
