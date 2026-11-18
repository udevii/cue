import type { CueApi, DiscoverRequest, DiscoverResult, ProtoSettings, Title } from "../types";
import { CATALOG, trendingIds } from "../data/catalog";
import { localDiscover } from "./discover";

export class ApiError extends Error {
  constructor(message: string, readonly status = 500) {
    super(message);
  }
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

// talks to the Next.js routes in app/api

export function createHttpApi(base = ""): CueApi {
  const qs = (s: ProtoSettings, extra = "") => `?latency=${s.latencyMs}${extra}`;
  async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
    const res = await fetch(base + path, { signal });
    if (!res.ok) throw new ApiError(`${path} returned ${res.status}`, res.status);
    return (await res.json()) as T;
  }
  let mode: Promise<"ai" | "offline"> | null = null;
  return {
    getCatalog: (s, signal) => get<Title[]>(`/api/catalog${qs(s)}`, signal),
    getTrending: (s, signal) => get<string[]>(`/api/trending${qs(s, s.failTrending ? "&fail=1" : "")}`, signal),
    async discover(req, s, signal) {
      const res = await fetch(`${base}/api/discover${qs(s)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(req),
        signal,
      });
      if (!res.ok) throw new ApiError(`/api/discover returned ${res.status}`, res.status);
      return (await res.json()) as DiscoverResult;
    },
    aiMode() {
      mode ??= get<{ mode: "ai" | "offline" }>("/api/discover").then((r) => r.mode).catch(() => "offline" as const);
      return mode;
    },
  };
}

// same thing but runs in the browser (for the single file demo)
// no server here, so Ask Cue always uses the keyword matcher

export function createLocalApi(): CueApi {
  return {
    async getCatalog(s, signal) {
      await delay(s.latencyMs, signal);
      return CATALOG;
    },
    async getTrending(s, signal) {
      await delay(s.latencyMs * 1.3, signal);
      if (s.failTrending) throw new ApiError("Trending service unavailable (simulated)", 503);
      return trendingIds(CATALOG);
    },
    async discover(req: DiscoverRequest, s, signal) {
      await delay(Math.min(s.latencyMs, 900), signal);
      return localDiscover(req, CATALOG);
    },
    async aiMode() {
      return "offline";
    },
  };
}
