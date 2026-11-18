import { NextResponse, type NextRequest } from "next/server";
import { CATALOG, trendingIds } from "../../../src/data/catalog";

/** GET /api/trending?latency=700&fail=1 — ranked ids. `fail=1` simulates an outage for error-state reviews. */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const latency = Math.min(Number(params.get("latency") ?? 0) || 0, 5000);
  if (latency) await new Promise((r) => setTimeout(r, latency * 1.3));
  if (params.get("fail") === "1") {
    return NextResponse.json({ error: "Trending service unavailable (simulated)" }, { status: 503 });
  }
  return NextResponse.json(trendingIds(CATALOG), { headers: { "cache-control": "no-store" } });
}
