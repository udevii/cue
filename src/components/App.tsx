"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import type { CueApi, Device, ProtoSettings, Route, Title, WatchProgress } from "../types";
import { FEATURED_IDS, SEED_LIST, SEED_PROGRESS, byId } from "../data/catalog";
import { moreLike } from "../lib/discover";
import { createKeyHandler, move, type Direction } from "../lib/spatialNav";
import { load, save } from "../lib/storage";
import { Hero } from "./Hero";
import { Rail, type RailState } from "./Rail";
import { Card } from "./Card";
import { AskPage, AskPrompt } from "./AskCue";
import { DetailsDialog, Player } from "./Overlays";
import { ProtoPanel, Remote } from "./Controls";

type Load<T> = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: T };

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const defaultSettings = (): ProtoSettings => ({ latencyMs: 700, failTrending: false, reducedMotion: !!prefersReducedMotion() });

export function App({ api }: { api: CueApi }): ReactElement {
  const [device, setDevice] = useState<Device>(() => load<Device>("device", typeof window !== "undefined" && window.innerWidth < 700 ? "mobile" : "web"));
  const [settings, setSettings] = useState<ProtoSettings>(() => load("settings", defaultSettings()));
  const [route, setRoute] = useState<Route>("home");
  const [askQuery, setAskQuery] = useState("");
  const [catalog, setCatalog] = useState<Load<Title[]>>({ status: "loading" });
  const [trending, setTrending] = useState<Load<string[]>>({ status: "loading" });
  const [catalogTry, setCatalogTry] = useState(0);
  const [trendingTry, setTrendingTry] = useState(0);
  const [myList, setMyList] = useState<string[]>(() => load("list", SEED_LIST));
  const [progress, setProgress] = useState<WatchProgress[]>(() => load("progress", SEED_PROGRESS));
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [remoteVisible, setRemoteVisible] = useState(true);
  const [aiMode, setAiMode] = useState<"ai" | "offline" | "checking">("checking");
  const [, setTick] = useState(0);
  const appRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => save("device", device), [device]);
  useEffect(() => save("settings", settings), [settings]);
  useEffect(() => save("list", myList), [myList]);
  useEffect(() => save("progress", progress), [progress]);
  useEffect(() => { api.aiMode().then(setAiMode); }, [api]);
  // update live progress bars
  useEffect(() => { const id = setInterval(() => setTick((n) => n + 1), 30_000); return () => clearInterval(id); }, []);

  // --- data ---

  useEffect(() => {
    const ctrl = new AbortController();
    setCatalog({ status: "loading" });
    api.getCatalog(settings, ctrl.signal)
      .then((data) => setCatalog({ status: "ready", data }))
      .catch((e: Error) => { if (e.name !== "AbortError") setCatalog({ status: "error", message: e.message }); });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, catalogTry, settings.latencyMs]);

  useEffect(() => {
    const ctrl = new AbortController();
    setTrending({ status: "loading" });
    api.getTrending(settings, ctrl.signal)
      .then((data) => setTrending({ status: "ready", data }))
      .catch((e: Error) => { if (e.name !== "AbortError") setTrending({ status: "error", message: e.message }); });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, trendingTry, settings.latencyMs, settings.failTrending]);

  const titles = catalog.status === "ready" ? catalog.data : [];
  const inList = useCallback((id: string) => myList.includes(id), [myList]);
  const progressFor = useCallback((id: string) => progress.find((p) => p.id === id), [progress]);

  const rails = useMemo(() => {
    const pick = (f: (t: Title) => boolean) => titles.filter((t) => t.kind !== "live" && f(t));
    const anchor = progress.length ? byId(titles, progress[0].id) : undefined;
    return {
      continueItems: progress.map((p) => byId(titles, p.id)).filter((t): t is Title => !!t),
      featured: FEATURED_IDS.map((id) => byId(titles, id)).filter((t): t is Title => !!t),
      live: titles.filter((t) => t.kind === "live"),
      because: anchor ? { anchor, items: moreLike(anchor, titles) } : null,
      short: pick((t) => t.runtimeMin <= 30),
      tense: pick((t) => t.moods.includes("tense")),
      cozy: pick((t) => t.moods.includes("cozy")),
      docs: pick((t) => t.genres.includes("Documentary")),
      kids: pick((t) => t.genres.includes("Kids")),
    };
  }, [titles, progress]);

  // --- actions ---

  const toggleList = useCallback((t: Title) => {
    setMyList((l) => (l.includes(t.id) ? l.filter((x) => x !== t.id) : [t.id, ...l]));
  }, []);

  const open = useCallback((t: Title) => setDetailsId(t.id), []);
  const play = useCallback((t: Title) => { setDetailsId(null); setPlayingId(t.id); }, []);

  const closePlayer = (pct: number) => {
    const t = playingId ? byId(titles, playingId) : undefined;
    setPlayingId(null);
    if (!t || t.kind === "live") return;
    setProgress((list) => {
      const rest = list.filter((p) => p.id !== t.id);
      if (pct >= 0.97) return rest;
      const left = Math.max(1, Math.round(t.runtimeMin * (1 - pct)));
      const prev = list.find((p) => p.id === t.id);
      const ep = t.kind === "series" ? (prev?.label.split(" · ")[0] ?? "S1 E1") + " · " : "";
      return [{ id: t.id, pct, label: `${ep}${left} min left` }, ...rest];
    });
  };

  const ask = (q: string) => { setAskQuery(q); setRoute("ask"); };

  const go = (r: Route) => {
    setRoute(r);
    mainRef.current?.scrollTo?.({ top: 0 });
    appRef.current?.scrollTo?.({ top: 0 });
  };

  const back = useCallback(() => {
    if (playingId) return; // Player handles its own Back so progress is saved.
    if (detailsId) setDetailsId(null);
    else if (panelOpen) setPanelOpen(false);
    else if (route !== "home") setRoute("home");
  }, [playingId, detailsId, panelOpen, route]);

  // --- remote / keyboard ---

  const scope = useCallback((): ParentNode | null => {
    const root = appRef.current;
    if (!root) return null;
    const layers = root.querySelectorAll("[data-nav-scope]");
    return layers.length ? layers[layers.length - 1] : root;
  }, []);

  useEffect(() => {
    const handler = createKeyHandler({ scope, onBack: back, reducedMotion: settings.reducedMotion });
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-nav-ignore]")) return;
      if (playingId && (e.key === "Escape" || e.key === "Backspace")) {
        e.preventDefault();
        appRef.current?.querySelector<HTMLButtonElement>(".player__top button")?.click();
        return;
      }
      // on web/mobile only use arrows for nav if they're already using the keyboard,
      // otherwise let the page scroll
      const keyboardActive = !!target?.hasAttribute?.("data-nav");
      if (device !== "tv" && !keyboardActive && e.key.startsWith("Arrow")) return;
      handler(e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scope, back, settings.reducedMotion, device, playingId]);

  // focus something right away in TV mode
  useEffect(() => {
    if (device !== "tv") return;
    const id = setTimeout(() => {
      const s = scope();
      if (s && !(s as Node).contains(document.activeElement)) move("down", s, true);
    }, 50);
    return () => clearTimeout(id);
  }, [device, route, catalog.status, scope]);

  const remoteMove = (d: Direction) => { const s = scope(); if (s) move(d, s, settings.reducedMotion); };
  const remoteOk = () => {
    const a = document.activeElement as HTMLElement | null;
    if (a && appRef.current?.contains(a)) a.click();
  };

  // --- render ---

  const details = detailsId ? byId(titles, detailsId) : undefined;
  const playing = playingId ? byId(titles, playingId) : undefined;
  const loading = catalog.status === "loading";
  const railState = (items: Title[]): RailState => (loading ? { status: "loading" } : { status: "ready", items });

  const trendingState: RailState =
    trending.status === "loading" || loading ? { status: "loading" }
    : trending.status === "error" ? { status: "error", message: "The service didn't respond. Your other rows still work.", onRetry: () => setTrendingTry((n) => n + 1) }
    : { status: "ready", items: trending.data.map((id) => byId(titles, id)).filter((t): t is Title => !!t) };

  const navItems: Array<{ r: Route; label: string }> = [
    { r: "home", label: "Home" },
    { r: "ask", label: "Ask Cue" },
    { r: "list", label: "My List" },
  ];

  const framed = device === "mobile" && typeof window !== "undefined" && window.innerWidth >= 700;

  return (
    <div className={`stage stage--${device} ${framed ? "stage--framed" : ""}`} data-motion={settings.reducedMotion ? "reduced" : "full"}>
      <div className="device">
        <div ref={appRef} className="cue-app" data-device={device}>
          <a className="skip" href="#cue-main">Skip to content</a>
          <header className="topbar">
            <button type="button" className="logo" data-nav="" aria-label="Cue home" onClick={() => go("home")}>
              <span className="logo__light" aria-hidden="true" />cue
            </button>
            <nav aria-label="Main" className="topnav">
              {navItems.map((n) => (
                <button key={n.r} type="button" className="topnav__item" data-nav="" data-nav-group="topnav" aria-current={route === n.r ? "page" : undefined} onClick={() => go(n.r)}>
                  {n.label}
                </button>
              ))}
            </nav>
          </header>

          <main id="cue-main" ref={mainRef} className="main" tabIndex={-1}>
            {catalog.status === "error" ? (
              <div className="page empty empty--page" role="alert">
                <p className="empty__title">Cue can't reach the catalog right now.</p>
                <p>{catalog.message}. Check your connection, then try again.</p>
                <button type="button" className="btn btn--primary" data-nav="" onClick={() => setCatalogTry((n) => n + 1)}>Try again</button>
              </div>
            ) : route === "home" ? (
              <>
                <Hero items={rails.featured} loading={loading} reducedMotion={settings.reducedMotion} inList={inList} onPlay={play} onInfo={open} onToggleList={toggleList} />
                <div className="rails">
                  <Rail id="continue" heading="Continue watching" state={railState(rails.continueItems)} variant="continue" progressFor={progressFor} inList={inList} onOpen={open} />
                  <Rail id="trending" heading="Top 10 this week" state={trendingState} variant="top10" inList={inList} onOpen={open} />
                  <section className="rail rail--ask" aria-label="Ask Cue">
                    <AskPrompt compact onAsk={ask} aiMode={aiMode} />
                  </section>
                  <Rail id="live" heading="Live now" state={railState(rails.live)} variant="live" inList={inList} onOpen={open} />
                  {rails.because ? (
                    <Rail id="because" heading={`Because you watched ${rails.because.anchor.name}`} state={railState(rails.because.items)} inList={inList} onOpen={open} />
                  ) : null}
                  <Rail id="short" heading="Short on time" subheading="30 minutes or less" state={railState(rails.short)} inList={inList} onOpen={open} />
                  <Rail id="tense" heading="Edge of your seat" state={railState(rails.tense)} inList={inList} onOpen={open} />
                  <Rail id="cozy" heading="Cozy night in" state={railState(rails.cozy)} inList={inList} onOpen={open} />
                  <Rail id="docs" heading="True stories" state={railState(rails.docs)} inList={inList} onOpen={open} />
                  <Rail id="kids" heading="For the kids" state={railState(rails.kids)} inList={inList} onOpen={open} />
                </div>
              </>
            ) : route === "ask" ? (
              <AskPage api={api} settings={settings} catalog={titles} query={askQuery} aiMode={aiMode} inList={inList} onOpen={open} onAsk={ask} />
            ) : (
              <div className="page">
                <header className="page__head">
                  <p className="eyebrow">Saved for later</p>
                  <h1 className="page__title">My List</h1>
                </header>
                {loading ? null : myList.length ? (
                  <ul className="grid">
                    {myList.map((id) => byId(titles, id)).filter((t): t is Title => !!t).map((t) => (
                      <li key={t.id}><Card title={t} group="list" inList onOpen={open} /></li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty empty--page">
                    <div className="empty__mark" aria-hidden="true">+</div>
                    <p className="empty__title">Nothing saved yet</p>
                    <p>Press + on any title to keep it here for later.</p>
                    <div className="empty__actions">
                      <button type="button" className="btn btn--primary" data-nav="" onClick={() => go("home")}>Browse Top 10</button>
                      <button type="button" className="btn btn--ghost" data-nav="" onClick={() => go("ask")}>Ask Cue for ideas</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

          <nav className="tabbar" aria-label="Main">
            {navItems.map((n) => (
              <button key={n.r} type="button" className="tabbar__item" data-nav="" aria-current={route === n.r ? "page" : undefined} onClick={() => go(n.r)}>
                <span className={`tabbar__icon tabbar__icon--${n.r}`} aria-hidden="true" />
                {n.label}
              </button>
            ))}
          </nav>

          {details ? (
            <DetailsDialog
              title={details}
              progress={progressFor(details.id)}
              related={moreLike(details, titles)}
              inList={inList(details.id)}
              isInList={inList}
              onPlay={play}
              onToggleList={toggleList}
              onOpen={open}
              onClose={() => setDetailsId(null)}
            />
          ) : null}
          {playing ? (
            <Player title={playing} startPct={progressFor(playing.id)?.pct ?? 0} reducedMotion={settings.reducedMotion} onClose={closePlayer} />
          ) : null}

          {device === "tv" ? (
            <p className="tv-hints" aria-hidden="true">
              <kbd>◀ ▲ ▼ ▶</kbd> Move <kbd>OK</kbd> Select <kbd>Back</kbd> Go back
            </p>
          ) : null}
        </div>
      </div>

      {device === "tv" && remoteVisible ? (
        <Remote onMove={remoteMove} onOk={remoteOk} onBack={() => (playingId ? appRef.current?.querySelector<HTMLButtonElement>(".player__top button")?.click() : back())} onHide={() => setRemoteVisible(false)} />
      ) : null}

      <ProtoPanel
        open={panelOpen}
        device={device}
        settings={settings}
        aiMode={aiMode}
        onToggle={() => setPanelOpen((o) => !o)}
        onDevice={(d) => { setDevice(d); setRemoteVisible(true); }}
        onSettings={setSettings}
        onReset={() => { setMyList(SEED_LIST); setProgress(SEED_PROGRESS); }}
      />
    </div>
  );
}
