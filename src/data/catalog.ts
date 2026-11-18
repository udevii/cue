import type { Title, WatchProgress } from "../types";

// fake catalog, all titles/people/channels are made up
// poster art gets generated from `art`
export const CATALOG: Title[] = [
  {
    id: "lantern-keepers", name: "The Lantern Keepers", kind: "series", year: 2025, rating: "TV-14",
    genres: ["Drama", "Mystery"], moods: ["cozy", "thoughtful"], runtimeMin: 48, seasons: 2,
    synopsis: "Two estranged sisters inherit a lighthouse on the Maine coast, along with forty years of logbooks that don't add up.",
    cast: ["Maren Oduya", "Celia Hartwell", "Tom Reyes"], art: { hue: 205, hue2: 40, motif: "beam" }, trendingRank: 3,
  },
  {
    id: "last-train-harlow", name: "Last Train to Harlow", kind: "movie", year: 2024, rating: "R",
    genres: ["Thriller"], moods: ["tense", "dark"], runtimeMin: 104,
    synopsis: "A night conductor realizes one passenger has boarded the final train out of the city every night for a year and never gotten off.",
    cast: ["Dev Amari", "Rosa Lindqvist"], art: { hue: 350, hue2: 20, motif: "stripes" }, trendingRank: 5,
  },
  {
    id: "small-wins", name: "Small Wins", kind: "series", year: 2023, rating: "TV-PG",
    genres: ["Comedy"], moods: ["funny", "cozy", "uplifting"], runtimeMin: 22, seasons: 3,
    synopsis: "A burned-out pastry chef takes over her uncle's failing bowling alley in Duluth and refuses to let it close quietly.",
    cast: ["June Okafor", "Barry Kessel", "Lin Mae"], art: { hue: 28, hue2: 330, motif: "rings" }, trendingRank: 1,
  },
  {
    id: "ground-control", name: "Ground Control", kind: "movie", year: 2025, rating: "PG-13",
    genres: ["Sci-Fi", "Thriller"], moods: ["tense", "thoughtful"], runtimeMin: 118,
    synopsis: "A deep-space probe starts answering questions nobody asked it. A junior engineer has nine days to find out who is on the other end.",
    cast: ["Priya Nandakumar", "Owen Blake"], art: { hue: 230, hue2: 190, motif: "orbit" }, trendingRank: 2,
  },
  {
    id: "kitchen-table", name: "Kitchen Table", kind: "series", year: 2024, rating: "TV-G",
    genres: ["Documentary"], moods: ["cozy", "thoughtful"], runtimeMin: 30, seasons: 1,
    synopsis: "Six families in six cities each share one recipe that has outlived everyone who first cooked it.",
    cast: ["Narrated by Ada Whitlock"], art: { hue: 38, hue2: 12, motif: "horizon" },
  },
  {
    id: "paper-moons", name: "Paper Moons", kind: "movie", year: 2023, rating: "PG-13",
    genres: ["Romance", "Comedy"], moods: ["romantic", "chill", "funny"], runtimeMin: 96,
    synopsis: "Two rival crossword constructors start leaving coded messages for each other in the Sunday puzzle.",
    cast: ["Isla Moreno", "Theo Grant"], art: { hue: 260, hue2: 320, motif: "rings" }, trendingRank: 8,
  },
  {
    id: "fault-lines", name: "Fault Lines", kind: "series", year: 2024, rating: "TV-MA",
    genres: ["Thriller", "Drama"], moods: ["tense", "dark"], runtimeMin: 55, seasons: 2,
    synopsis: "A seismologist in Oakland discovers that a string of small quakes is being covered up by the agency she works for.",
    cast: ["Hana Ito", "Marcus Bell", "Gwen Adler"], art: { hue: 12, hue2: 45, motif: "waves" }, trendingRank: 4,
  },
  {
    id: "bramble-bolt", name: "Bramble & Bolt", kind: "series", year: 2022, rating: "TV-Y",
    genres: ["Animation", "Kids"], moods: ["funny", "adventurous"], runtimeMin: 11, seasons: 4,
    synopsis: "A hedgehog inventor and her overconfident robot fix problems around Thistle Hollow, usually by causing bigger ones.",
    cast: ["Voices of Pip Carver", "Sam Ostrowski"], art: { hue: 95, hue2: 50, motif: "blocks" },
  },
  {
    id: "supper-club", name: "Supper Club Wars", kind: "series", year: 2025, rating: "TV-PG",
    genres: ["Reality"], moods: ["funny", "chill"], runtimeMin: 42, seasons: 1,
    synopsis: "Eight home cooks run pop-up supper clubs out of their apartments. Diners vote with their wallets.",
    cast: ["Hosted by Remy Castellanos"], art: { hue: 340, hue2: 30, motif: "grid" }, trendingRank: 7,
  },
  {
    id: "full-court", name: "Full Court: Year One", kind: "series", year: 2025, rating: "TV-14",
    genres: ["Documentary", "Sports"], moods: ["uplifting", "adventurous"], runtimeMin: 45, seasons: 1,
    synopsis: "A season inside an expansion women's basketball team, from open tryouts to the first home win.",
    cast: ["The Harbor City Swell"], art: { hue: 18, hue2: 200, motif: "grid" }, trendingRank: 6,
  },
  {
    id: "quiet-hours", name: "Quiet Hours", kind: "series", year: 2024, rating: "TV-14",
    genres: ["Mystery", "Drama"], moods: ["dark", "thoughtful", "tense"], runtimeMin: 50, seasons: 1,
    synopsis: "A hospital night nurse notices her patients keep describing the same visitor, one who isn't on any staff list.",
    cast: ["Abena Mensah", "Colin Rourke"], art: { hue: 180, hue2: 240, motif: "beam" },
  },
  {
    id: "plan-b", name: "Retirement Plan B", kind: "movie", year: 2024, rating: "PG-13",
    genres: ["Comedy"], moods: ["funny", "uplifting"], runtimeMin: 92,
    synopsis: "Three friends from a Florida retirement community start a garage band to win back their deposit from a shady promoter.",
    cast: ["Lorraine Fitch", "Manny Delgado", "Bea Sorensen"], art: { hue: 48, hue2: 175, motif: "horizon" }, trendingRank: 10,
  },
  {
    id: "orbit-city", name: "Orbit City", kind: "series", year: 2025, rating: "TV-PG",
    genres: ["Sci-Fi", "Drama"], moods: ["adventurous", "thoughtful"], runtimeMin: 44, seasons: 1,
    synopsis: "The first teenagers born on a commercial space station are about to be sent home to an Earth they have never seen.",
    cast: ["Kai Watanabe", "Nell Ashby"], art: { hue: 250, hue2: 280, motif: "orbit" }, trendingRank: 9,
  },
  {
    id: "wild-season", name: "Wild Season", kind: "series", year: 2023, rating: "TV-G",
    genres: ["Documentary"], moods: ["chill", "thoughtful"], runtimeMin: 50, seasons: 1,
    synopsis: "A year on the Alaskan coast following one brown bear family through all four seasons.",
    cast: ["Narrated by Elias Varga"], art: { hue: 140, hue2: 200, motif: "waves" },
  },
  {
    id: "cold-open", name: "Cold Open", kind: "series", year: 2024, rating: "TV-14",
    genres: ["Comedy"], moods: ["funny"], runtimeMin: 24, seasons: 2,
    synopsis: "The writers' room of a struggling late-night sketch show has one season left to land a single sketch people actually share.",
    cast: ["Ravi Mehta", "Dana Pruitt", "Jonah Weiss"], art: { hue: 200, hue2: 330, motif: "stripes" },
  },
  {
    id: "understudy", name: "The Understudy", kind: "movie", year: 2025, rating: "R",
    genres: ["Thriller", "Mystery"], moods: ["tense", "dark"], runtimeMin: 109,
    synopsis: "An understudy gets her shot when the lead vanishes during opening week, and the theater's old ghost stories start coming true.",
    cast: ["Sofia Brandt", "Felix Aure"], art: { hue: 0, hue2: 280, motif: "beam" },
  },
  {
    id: "sunday-gravy", name: "Sunday Gravy", kind: "movie", year: 2023, rating: "PG-13",
    genres: ["Romance", "Comedy"], moods: ["romantic", "cozy", "funny"], runtimeMin: 101,
    synopsis: "A Brooklyn caterer fakes an engagement to win the family restaurant back from her cousin.",
    cast: ["Gina Russo", "Andre Fields"], art: { hue: 8, hue2: 40, motif: "rings" },
  },
  {
    id: "signal-fire", name: "Signal Fire", kind: "series", year: 2024, rating: "TV-14",
    genres: ["Drama"], moods: ["tense", "adventurous"], runtimeMin: 52, seasons: 1,
    synopsis: "A volunteer fire crew in a dry Colorado town holds the line through the worst fire season in a century.",
    cast: ["Wes Halloran", "Tamsin Cole", "Luis Ortega"], art: { hue: 22, hue2: 0, motif: "horizon" },
  },
  {
    id: "little-astronomers", name: "Little Astronomers", kind: "series", year: 2024, rating: "TV-Y",
    genres: ["Kids", "Documentary"], moods: ["thoughtful", "uplifting"], runtimeMin: 15, seasons: 2,
    synopsis: "Kids ask real scientists the space questions grown-ups are too embarrassed to ask.",
    cast: ["Hosted by Dr. Imani Brooks"], art: { hue: 240, hue2: 50, motif: "orbit" },
  },
  {
    id: "garden-show", name: "Murder at the Garden Show", kind: "movie", year: 2025, rating: "PG",
    genres: ["Mystery", "Comedy"], moods: ["cozy", "funny"], runtimeMin: 94,
    synopsis: "A retired botanist takes it personally when a judge is poisoned with one of her prize-winning foxgloves.",
    cast: ["Margaret Ellery", "Simon Achebe"], art: { hue: 120, hue2: 300, motif: "blocks" },
  },
  {
    id: "low-tide", name: "Low Tide", kind: "series", year: 2023, rating: "TV-MA",
    genres: ["Drama"], moods: ["thoughtful", "dark"], runtimeMin: 47, seasons: 2,
    synopsis: "After the cannery closes, a Rhode Island fishing town has to decide whether to sell its harbor to a billionaire.",
    cast: ["Pete Callahan", "Rosalind Kerr"], art: { hue: 195, hue2: 215, motif: "waves" },
  },
  {
    id: "five-stars", name: "Five Stars", kind: "series", year: 2025, rating: "TV-14",
    genres: ["Comedy"], moods: ["funny", "chill"], runtimeMin: 21, seasons: 1,
    synopsis: "A rideshare driver rates every passenger in voiceover. None of them know she is writing a novel about them.",
    cast: ["Tasha Monroe", "Eli Park"], art: { hue: 50, hue2: 10, motif: "grid" },
  },
  {
    id: "restoration", name: "Restoration", kind: "series", year: 2024, rating: "TV-G",
    genres: ["Documentary"], moods: ["chill", "thoughtful", "cozy"], runtimeMin: 40, seasons: 2,
    synopsis: "Conservators bring damaged paintings, quilts and pinball machines back to life, one careful layer at a time.",
    cast: ["Featuring the Halvorsen Studio"], art: { hue: 30, hue2: 190, motif: "blocks" },
  },
  {
    id: "neon-divide", name: "Neon Divide", kind: "series", year: 2025, rating: "TV-MA",
    genres: ["Sci-Fi", "Thriller"], moods: ["dark", "tense"], runtimeMin: 58, seasons: 1,
    synopsis: "In a city that trades memories like currency, a detective is hired to find the one memory she sold.",
    cast: ["Yuki Sato", "Damon Kraft"], art: { hue: 300, hue2: 190, motif: "grid" },
  },
  {
    id: "first-dance", name: "First Dance", kind: "series", year: 2024, rating: "TV-PG",
    genres: ["Reality", "Romance"], moods: ["uplifting", "romantic"], runtimeMin: 43, seasons: 2,
    synopsis: "Engaged couples learn their wedding dance from scratch in six weeks, with one surprise guest instructor.",
    cast: ["Hosted by Carmen Vidal"], art: { hue: 330, hue2: 280, motif: "rings" },
  },
  {
    id: "beach-week", name: "Beach Week", kind: "movie", year: 2024, rating: "R",
    genres: ["Comedy"], moods: ["funny", "chill"], runtimeMin: 89,
    synopsis: "Four college roommates reunite ten years later at the same rental house, which is now much worse.",
    cast: ["Nico Albright", "Priya Shah", "Grant Doyle", "Mel Ochoa"], art: { hue: 185, hue2: 45, motif: "horizon" },
  },
  {
    id: "summit", name: "Summit", kind: "movie", year: 2023, rating: "PG-13",
    genres: ["Documentary"], moods: ["adventurous", "tense"], runtimeMin: 112,
    synopsis: "Two climbers attempt an unclimbed face in the Karakoram with no fixed ropes and no backup plan.",
    cast: ["Ines Varga", "Tenzin Dorje"], art: { hue: 210, hue2: 0, motif: "stripes" },
  },
  {
    id: "holiday-swap", name: "Holiday Swap", kind: "movie", year: 2025, rating: "PG",
    genres: ["Romance", "Comedy"], moods: ["cozy", "romantic"], runtimeMin: 95,
    synopsis: "Two strangers swap apartments for the holidays and keep running into each other's lives.",
    cast: ["Clara Benning", "Jamal Hughes"], art: { hue: 355, hue2: 140, motif: "rings" },
  },
  {
    id: "mapmakers-daughter", name: "The Mapmaker's Daughter", kind: "movie", year: 2024, rating: "PG-13",
    genres: ["Drama"], moods: ["thoughtful", "romantic"], runtimeMin: 121,
    synopsis: "In 1890s Lisbon, a mapmaker's daughter secretly finishes her father's chart of a coastline that may not exist.",
    cast: ["Beatriz Lobo", "Henrik Sand"], art: { hue: 35, hue2: 200, motif: "waves" },
  },
  {
    id: "pocket-dragons", name: "Pocket Dragons", kind: "series", year: 2025, rating: "TV-Y",
    genres: ["Animation", "Kids"], moods: ["adventurous", "funny", "uplifting"], runtimeMin: 12, seasons: 1,
    synopsis: "Tiny dragons who live in a kid's backpack help her get through the first year at a new school.",
    cast: ["Voices of Lila Fenwick", "Ozzie Brandt"], art: { hue: 160, hue2: 280, motif: "blocks" },
  },
  {
    id: "news-now", name: "Cue News Now", kind: "live", year: 2026, rating: "TV-PG",
    genres: ["News"], moods: ["thoughtful"], runtimeMin: 60,
    synopsis: "Live headlines, weather and the stories people are talking about, updated through the day.",
    cast: ["Anchored by Dana Whitfield"], art: { hue: 215, hue2: 0, motif: "grid" },
    live: { channel: "Cue News", startedMinAgo: 22, durationMin: 60 },
  },
  {
    id: "harbor-ridge", name: "Harbor FC vs. Ridge United", kind: "live", year: 2026, rating: "TV-G",
    genres: ["Sports"], moods: ["tense", "adventurous"], runtimeMin: 115,
    synopsis: "Atlantic League soccer, live from Harbor Stadium. Both sides need a win to stay in the playoff race.",
    cast: ["Call by Rob Mallory", "Kim Adeyemi"], art: { hue: 140, hue2: 220, motif: "stripes" },
    live: { channel: "Cue Sports 1", startedMinAgo: 64, durationMin: 115 },
  },
  {
    id: "late-laughs", name: "Late Laughs Live", kind: "live", year: 2026, rating: "TV-14",
    genres: ["Comedy"], moods: ["funny", "chill"], runtimeMin: 30,
    synopsis: "Stand-up sets from the Basement Room, streamed live with no second takes.",
    cast: ["Hosted by Ty Brannigan"], art: { hue: 280, hue2: 40, motif: "beam" },
    live: { channel: "Cue Laughs", startedMinAgo: 9, durationMin: 30 },
  },
];

// starting continue watching data
export const SEED_PROGRESS: WatchProgress[] = [
  { id: "small-wins", pct: 0.62, label: "S2 E4 · 9 min left" },
  { id: "fault-lines", pct: 0.31, label: "S1 E7 · 38 min left" },
  { id: "lantern-keepers", pct: 0.86, label: "S1 E2 · 7 min left" },
];

export const SEED_LIST: string[] = ["ground-control", "garden-show", "restoration"];

export const FEATURED_IDS = ["ground-control", "lantern-keepers", "full-court", "small-wins"];

export function byId(catalog: Title[], id: string): Title | undefined {
  return catalog.find((t) => t.id === id);
}

export function trendingIds(catalog: Title[]): string[] {
  return catalog
    .filter((t) => t.trendingRank)
    .sort((a, b) => (a.trendingRank ?? 99) - (b.trendingRank ?? 99))
    .map((t) => t.id);
}
