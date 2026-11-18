import type { DiscoverRequest, DiscoverResult, Genre, Mood, Title } from "../types";

// similarity, used for "Because you watched" and "More like this"

export function similarity(a: Title, b: Title): number {
  if (a.id === b.id) return -1;
  const g = a.genres.filter((x) => b.genres.includes(x)).length;
  const m = a.moods.filter((x) => b.moods.includes(x)).length;
  return g * 2 + m + (a.kind === b.kind ? 0.5 : 0);
}

export function moreLike(target: Title, catalog: Title[], n = 8): Title[] {
  return catalog
    .filter((t) => t.kind !== "live" && t.id !== target.id)
    .map((t) => ({ t, s: similarity(target, t) }))
    .filter((x) => x.s > 1)
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((x) => x.t);
}

// offline matcher for when the AI isn't available
// turns the request into labels (the chips) and ranks titles by them

interface Constraint {
  label: string;
  // titles that fail this get removed
  filter?: (t: Title) => boolean;
  // adds to the score
  score?: (t: Title) => number;
  // text for the reason line
  because?: (t: Title) => string | null;
}

const MOOD_WORDS: Array<[RegExp, Mood, string]> = [
  [/\b(funny|laugh|hilarious|comed(y|ies)|silly|light ?hearted)\b/, "funny", "Funny"],
  [/\b(cozy|cosy|comfort|rainy|snug|wind down)\b/, "cozy", "Cozy"],
  [/\b(tense|edge|suspense|gripping|intense|nail)\b/, "tense", "Tense"],
  [/\b(dark|gritty|bleak|scary|creepy)\b/, "dark", "Dark"],
  [/\b(romantic|romance|date night|love story)\b/, "romantic", "Romantic"],
  [/\b(uplifting|feel[- ]good|happy|hopeful|inspiring)\b/, "uplifting", "Feel-good"],
  [/\b(thoughtful|smart|think|deep|moving)\b/, "thoughtful", "Thoughtful"],
  [/\b(adventure|adventurous|epic|exciting)\b/, "adventurous", "Adventurous"],
  [/\b(chill|relax|easy|background|low[- ]key)\b/, "chill", "Easygoing"],
];

const GENRE_WORDS: Array<[RegExp, Genre, string]> = [
  [/\b(documentar(y|ies)|docuseries|real life|true story|nature)\b/, "Documentary", "Documentary"],
  [/\b(sci[- ]?fi|space|future|futuristic|aliens?)\b/, "Sci-Fi", "Sci-fi"],
  [/\b(myster(y|ies)|whodunn?it|detective|crime)\b/, "Mystery", "Mystery"],
  [/\b(thriller|thrillers)\b/, "Thriller", "Thriller"],
  [/\b(drama|dramas)\b/, "Drama", "Drama"],
  [/\b(reality|competition)\b/, "Reality", "Reality"],
  [/\b(sports?|soccer|basketball|game|match)\b/, "Sports", "Sports"],
  [/\b(news|headlines)\b/, "News", "News"],
  [/\b(animated|animation|cartoon)\b/, "Animation", "Animated"],
];

function minutesLimit(q: string): number | null {
  const m = q.match(/\b(?:under|less than|shorter than|max(?:imum)?|within|<)\s*(\d{1,3})\s*(?:min|mins|minutes|m)\b/);
  if (m) return Number(m[1]);
  const h = q.match(/\b(?:under|less than)\s*(an|one|1|two|2)\s*hours?\b/);
  if (h) return /two|2/.test(h[1]) ? 120 : 60;
  if (/\b(short|quick|lunch break|before bed|half an hour)\b/.test(q)) return 30;
  return null;
}

function findReferenced(q: string, catalog: Title[]): Title | undefined {
  const lower = q.toLowerCase();
  return catalog.find((t) => {
    const name = t.name.toLowerCase().replace(/^the /, "");
    return lower.includes(name);
  });
}

export function parseRequest(req: DiscoverRequest, catalog: Title[]): Constraint[] {
  const q = req.query.toLowerCase();
  const out: Constraint[] = [];

  const limit = minutesLimit(q);
  if (limit) {
    out.push({
      label: `Under ${limit} min`,
      filter: (t) => t.runtimeMin <= limit,
      because: (t) => (t.kind === "series" ? `${t.runtimeMin}-minute episodes` : `${t.runtimeMin} minutes long`),
    });
  }

  if (/\b(kids?|children|family|all ages|my son|my daughter|toddler)\b/.test(q)) {
    out.push({
      label: "Family friendly",
      filter: (t) => ["TV-Y", "TV-G", "TV-PG", "PG"].includes(t.rating),
      score: (t) => (t.genres.includes("Kids") ? 3 : 0),
      because: (t) => `rated ${t.rating}`,
    });
  }

  if (/\b(movie|film)s?\b/.test(q)) out.push({ label: "Movies", filter: (t) => t.kind === "movie" });
  else if (/\b(series|show|shows|binge|season)\b/.test(q)) out.push({ label: "Series", filter: (t) => t.kind === "series" });
  if (/\b(live|right now|on now)\b/.test(q)) out.push({ label: "Live now", filter: (t) => t.kind === "live" });

  const lighter = /\b(less dark|lighter|not (too )?(dark|scary|intense)|nothing (dark|scary|sad))\b/.test(q);
  if (lighter) {
    out.push({ label: "Not dark", filter: (t) => !t.moods.includes("dark"), score: (t) => (t.moods.includes("funny") || t.moods.includes("uplifting") ? 0.5 : 0) });
  }

  for (const [re, mood, label] of MOOD_WORDS) {
    if (mood === "dark" && lighter) continue;
    if (re.test(q)) out.push({ label, score: (t) => (t.moods.includes(mood) ? 3 : 0), because: (t) => (t.moods.includes(mood) ? label.toLowerCase() : null) });
  }
  for (const [re, genre, label] of GENRE_WORDS) {
    if (re.test(q)) out.push({ label, score: (t) => (t.genres.includes(genre) ? 4 : 0), because: (t) => (t.genres.includes(genre) ? label.toLowerCase() : null) });
  }

  const ref = findReferenced(q, catalog);
  if (ref) {
    out.push({
      label: `Like ${ref.name}`,
      filter: (t) => t.id !== ref.id,
      score: (t) => similarity(ref, t),
      because: (t) => {
        const shared = t.moods.filter((m) => ref.moods.includes(m) && !(lighter && m === "dark"));
        return shared.length ? `${shared.slice(0, 2).join(" and ")} like ${ref.name}` : null;
      },
    });
  }

  const removed = new Set(req.removed.map((r) => r.toLowerCase()));
  return out.filter((c) => !removed.has(c.label.toLowerCase()));
}

export function localDiscover(req: DiscoverRequest, catalog: Title[]): DiscoverResult {
  const constraints = parseRequest(req, catalog);
  const wantsLive = constraints.some((c) => c.label === "Live now");
  const pool = catalog.filter((t) => (wantsLive ? true : t.kind !== "live"));

  const scored = pool
    .filter((t) => constraints.every((c) => !c.filter || c.filter(t)))
    .map((t) => {
      const score = constraints.reduce((s, c) => s + (c.score ? c.score(t) : 0), 0) + (t.trendingRank ? (11 - t.trendingRank) * 0.05 : 0);
      const reasons = constraints.map((c) => (c.because ? c.because(t) : null)).filter((x): x is string => !!x);
      return { t, score, reasons };
    })
    .filter((x) => (constraints.some((c) => c.score) ? x.score >= 1.5 : true))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const understood = constraints.map((c) => c.label);
  const heading = understood.length ? understood.slice(0, 3).join(" · ") : "Popular right now";

  return {
    heading,
    understood,
    source: "offline",
    picks: scored.map(({ t, reasons }) => ({
      id: t.id,
      reason: reasons.length ? capitalize(unique(reasons).slice(0, 3).join(", ")) + "." : capitalize(t.synopsis.split(".")[0]) + ".",
    })),
  };
}

// prompt + checking the answer

export function buildPrompt(req: DiscoverRequest, catalog: Title[]): string {
  const rows = catalog.map((t) =>
    JSON.stringify({
      id: t.id, name: t.name, kind: t.kind, rating: t.rating, minutes: t.runtimeMin,
      genres: t.genres, moods: t.moods, synopsis: t.synopsis,
    }),
  );
  return [
    "You are the discovery assistant inside Cue, a streaming app prototype.",
    "Recommend titles ONLY from the catalog below. Never invent titles.",
    "",
    `Viewer request: ${JSON.stringify(req.query)}`,
    req.removed.length ? `The viewer removed these interpretations, so do not apply them: ${req.removed.join(", ")}` : "",
    "",
    "Catalog (one JSON object per line):",
    ...rows,
    "",
    "Reply with ONLY a JSON object, no prose, in this shape:",
    '{"heading": "collection name, max 6 words", "understood": ["2-4 short labels for how you read the request, e.g. \\"Comedy\\", \\"Under 30 min\\""], "picks": [{"id": "catalog id", "reason": "one sentence, max 16 words, tied to the request"}]}',
    "Pick 3 to 8 titles, best first. Respect hard limits like runtime and age rating exactly.",
    "If nothing fits, return an empty picks array and use the heading to say what is missing.",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

// only keep ids that are actually in the catalog
export function parseModelResponse(text: string, catalog: Title[]): DiscoverResult | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as { heading?: unknown; understood?: unknown; picks?: unknown };
  const ids = new Set(catalog.map((t) => t.id));
  const seen = new Set<string>();
  const picks = Array.isArray(obj.picks)
    ? obj.picks
        .filter((p): p is { id: string; reason?: string } => !!p && typeof p === "object" && typeof (p as { id?: unknown }).id === "string")
        .filter((p) => ids.has(p.id) && !seen.has(p.id) && (seen.add(p.id), true))
        .slice(0, 8)
        .map((p) => ({ id: p.id, reason: typeof p.reason === "string" ? p.reason.slice(0, 160) : "" }))
    : [];
  return {
    heading: typeof obj.heading === "string" && obj.heading.trim() ? obj.heading.trim().slice(0, 60) : "Picked for you",
    understood: Array.isArray(obj.understood) ? obj.understood.filter((u): u is string => typeof u === "string").slice(0, 4) : [],
    picks,
    source: "ai",
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function unique<T>(xs: T[]): T[] {
  return Array.from(new Set(xs));
}
