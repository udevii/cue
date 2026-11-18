export type Genre =
  | "Comedy"
  | "Drama"
  | "Thriller"
  | "Mystery"
  | "Romance"
  | "Sci-Fi"
  | "Documentary"
  | "Reality"
  | "Animation"
  | "Kids"
  | "Sports"
  | "News";

export type Mood =
  | "funny"
  | "cozy"
  | "tense"
  | "dark"
  | "thoughtful"
  | "uplifting"
  | "romantic"
  | "adventurous"
  | "chill";

export type Motif = "orbit" | "stripes" | "horizon" | "grid" | "waves" | "rings" | "blocks" | "beam";

export interface Artwork {
  /** Base hue (0-360) for the generated key art. */
  hue: number;
  /** Accent hue for the gradient's far end. */
  hue2: number;
  motif: Motif;
}

export interface LiveSlot {
  channel: string;
  /** Minutes since the top of the current hour when the program started. */
  startedMinAgo: number;
  durationMin: number;
}

export interface Title {
  id: string;
  name: string;
  kind: "series" | "movie" | "live";
  year: number;
  rating: "TV-Y" | "TV-G" | "TV-PG" | "TV-14" | "TV-MA" | "PG" | "PG-13" | "R";
  genres: Genre[];
  moods: Mood[];
  /** Episode length for series, full length for movies. */
  runtimeMin: number;
  seasons?: number;
  synopsis: string;
  cast: string[];
  art: Artwork;
  /** 1 = most popular this week. */
  trendingRank?: number;
  live?: LiveSlot;
}

export interface WatchProgress {
  id: string;
  /** 0..1 through the current episode or movie. */
  pct: number;
  label: string;
}

export type Device = "web" | "mobile" | "tv";
export type Route = "home" | "ask" | "list";

export interface ProtoSettings {
  /** Simulated network latency for every API call. */
  latencyMs: number;
  /** Force the Trending endpoint to fail, to review the error state. */
  failTrending: boolean;
  reducedMotion: boolean;
}

export interface DiscoverRequest {
  query: string;
  /** Interpretation labels the viewer removed with the chip's x button. */
  removed: string[];
}

export interface DiscoverPick {
  id: string;
  reason: string;
}

export interface DiscoverResult {
  heading: string;
  understood: string[];
  picks: DiscoverPick[];
  source: "ai" | "offline";
  note?: string;
}

export interface CueApi {
  getCatalog(settings: ProtoSettings, signal?: AbortSignal): Promise<Title[]>;
  getTrending(settings: ProtoSettings, signal?: AbortSignal): Promise<string[]>;
  discover(req: DiscoverRequest, settings: ProtoSettings, signal?: AbortSignal): Promise<DiscoverResult>;
  // "ai" when a model is set up, otherwise "offline"
  aiMode(): Promise<"ai" | "offline">;
}
