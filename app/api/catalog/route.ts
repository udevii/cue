import { NextResponse, type NextRequest } from "next/server";
import { CATALOG } from "../../../src/data/catalog";

/** GET /api/catalog?latency=700 — the mock catalog, with optional simulated latency. */
export async function GET(req: NextRequest) {
  const latency = Math.min(Number(req.nextUrl.searchParams.get("latency") ?? 0) || 0, 5000);
  if (latency) await new Promise((r) => setTimeout(r, latency));
  return NextResponse.json(CATALOG, { headers: { "cache-control": "no-store" } });
}
