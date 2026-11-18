import { useEffect, useRef, useState, type ReactElement } from "react";
import type { Title } from "../types";
import { Poster } from "./Poster";
import { metaLine } from "./Card";

interface HeroProps {
  items: Title[];
  loading: boolean;
  reducedMotion: boolean;
  inList: (id: string) => boolean;
  onPlay: (t: Title) => void;
  onInfo: (t: Title) => void;
  onToggleList: (t: Title) => void;
}

const ROTATE_MS = 8000;

export function Hero({ items, loading, reducedMotion, inList, onPlay, onInfo, onToggleList }: HeroProps): ReactElement {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLElement>(null);

  // auto rotate, but not when hovered/focused or reduced motion is on
  useEffect(() => {
    if (reducedMotion || paused || items.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [reducedMotion, paused, items.length]);

  if (loading || !items.length) {
    return (
      <section className="hero hero--loading" aria-busy="true" aria-label="Featured">
        <div className="hero__art shimmer" />
        <div className="hero__body">
          <span className="shimmer shimmer--title" />
          <span className="shimmer shimmer--line" />
          <span className="shimmer shimmer--line short" />
        </div>
      </section>
    );
  }

  const t = items[index % items.length];
  const listed = inList(t.id);

  return (
    <section
      ref={root}
      className="hero"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => { if (!root.current?.contains(e.relatedTarget as Node)) setPaused(false); }}
    >
      <div className="hero__art" key={t.id}>
        <Poster seed={t.id} art={t.art} className="hero__svg" />
      </div>
      <div className="hero__scrim" />
      <div className="hero__body" aria-live={paused ? "polite" : "off"}>
        <p className="eyebrow">{t.kind === "movie" ? "Featured film" : "Featured series"} · {t.year}</p>
        <h1 className="hero__title">{t.name}</h1>
        <p className="hero__meta">{metaLine(t)}</p>
        <p className="hero__synopsis">{t.synopsis}</p>
        <div className="hero__actions">
          <button type="button" className="btn btn--primary" data-nav="" data-nav-default="" onClick={() => onPlay(t)}>
            <span aria-hidden="true">▶</span> Play
          </button>
          <button type="button" className="btn btn--ghost" data-nav="" onClick={() => onInfo(t)}>More info</button>
          <button type="button" className="btn btn--ghost btn--icon" data-nav="" aria-pressed={listed} aria-label={listed ? `Remove ${t.name} from My List` : `Add ${t.name} to My List`} onClick={() => onToggleList(t)}>
            {listed ? "✓" : "+"}
          </button>
        </div>
      </div>
      <div className="hero__dots" role="group" aria-label="Choose featured title">
        {items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            className="dot"
            aria-label={`Show ${it.name}`}
            aria-current={i === index % items.length}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
