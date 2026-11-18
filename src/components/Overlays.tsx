import { useEffect, useRef, useState, type ReactElement, type RefObject, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { Title, WatchProgress } from "../types";
import { Poster } from "./Poster";
import { Card, metaLine, liveStatus } from "./Card";

// keep tab inside the dialog, put focus back when it closes
function useDialogFocus(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>("[data-nav-default]") ?? ref.current?.querySelector<HTMLElement>("button");
    first?.focus({ preventScroll: true });
    return () => opener?.focus({ preventScroll: true });
  }, [ref]);

  return (e: ReactKeyboardEvent) => {
    if (e.key !== "Tab" || !ref.current) return;
    const items = Array.from(ref.current.querySelectorAll<HTMLElement>("button, [href], input"));
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
}

interface DetailsProps {
  title: Title;
  progress?: WatchProgress;
  related: Title[];
  inList: boolean;
  isInList: (id: string) => boolean;
  onPlay: (t: Title) => void;
  onToggleList: (t: Title) => void;
  onOpen: (t: Title) => void;
  onClose: () => void;
}

export function DetailsDialog({ title: t, progress, related, inList, isInList, onPlay, onToggleList, onOpen, onClose }: DetailsProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = useDialogFocus(ref);
  const live = t.kind === "live" ? liveStatus(t) : null;

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} className="dialog" role="dialog" aria-modal="true" aria-labelledby="details-title" data-nav-scope="" onKeyDown={onKeyDown}>
        <div className="dialog__art">
          <Poster seed={t.id} art={t.art} className="dialog__svg" />
          <div className="dialog__scrim" />
          <button type="button" className="icon-btn dialog__close" data-nav="" aria-label="Close details" onClick={onClose}>✕</button>
        </div>
        <div className="dialog__body">
          <p className="eyebrow">{live ? `Live on ${t.live!.channel}` : t.kind === "movie" ? "Film" : "Series"} · {t.year}</p>
          <h2 id="details-title" className="dialog__title">{t.name}</h2>
          <p className="dialog__meta">{live ? `${live.leftMin} min left` : metaLine(t)} · {t.moods.slice(0, 2).join(", ")}</p>
          <div className="dialog__actions">
            <button type="button" className="btn btn--primary" data-nav="" data-nav-default="" onClick={() => onPlay(t)}>
              <span aria-hidden="true">▶</span> {live ? "Watch live" : progress ? `Resume ${progress.label.split(" · ")[0]}` : "Play"}
            </button>
            {t.kind !== "live" ? (
              <button type="button" className="btn btn--ghost" data-nav="" aria-pressed={inList} onClick={() => onToggleList(t)}>
                {inList ? "✓ In My List" : "+ My List"}
              </button>
            ) : null}
          </div>
          <p className="dialog__synopsis">{t.synopsis}</p>
          <p className="dialog__cast"><span>Cast</span> {t.cast.join(", ")}</p>
          {related.length ? (
            <section className="dialog__more" aria-labelledby="more-like">
              <h3 id="more-like">More like this</h3>
              <ul className="grid">
                {related.slice(0, 6).map((r) => (
                  <li key={r.id}><Card title={r} group="more" inList={isInList(r.id)} onOpen={onOpen} /></li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface PlayerProps {
  title: Title;
  startPct: number;
  reducedMotion: boolean;
  onClose: (pct: number) => void;
}

// fake player, no actual video
export function Player({ title: t, startPct, reducedMotion, onClose }: PlayerProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = useDialogFocus(ref);
  const [pct, setPct] = useState(startPct);
  const [playing, setPlaying] = useState(true);
  const [chrome, setChrome] = useState(true);
  const pctRef = useRef(pct);
  pctRef.current = pct;
  const total = t.runtimeMin * 60;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setPct((p) => Math.min(1, p + 1 / total)), 1000);
    return () => clearInterval(id);
  }, [playing, total]);

  // hide controls after a few seconds
  useEffect(() => {
    if (!chrome || !playing) return;
    const id = setTimeout(() => setChrome(false), 3500);
    return () => clearTimeout(id);
  }, [chrome, playing]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div
      ref={ref}
      className={`player ${chrome ? "" : "player--idle"}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Now playing ${t.name}`}
      data-nav-scope=""
      onMouseMove={() => setChrome(true)}
      onKeyDown={(e) => { setChrome(true); onKeyDown(e); }}
    >
      <div className={`player__art ${reducedMotion ? "" : "player__art--drift"}`}>
        <Poster seed={t.id} art={t.art} className="player__svg" />
      </div>
      <div className="player__top">
        <button type="button" className="btn btn--ghost" data-nav="" onClick={() => onClose(pctRef.current)}>‹ Back</button>
        <p className="player__now">{t.name}</p>
      </div>
      <div className="player__bottom">
        <div className="scrub" role="progressbar" aria-label="Playback position" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct * 100)}>
          <span style={{ width: `${pct * 100}%` }} />
        </div>
        <div className="player__row">
          <button type="button" className="btn btn--primary" data-nav="" data-nav-default="" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>
            {playing ? "❚❚ Pause" : "▶ Play"}
          </button>
          <span className="player__time">{t.kind === "live" ? "Live" : `${fmt(pct * total)} / ${fmt(total)}`}</span>
        </div>
        <p className="player__note">Prototype player. No video plays; this tests the move from browsing to watching and back.</p>
      </div>
    </div>
  );
}
