import type { ReactElement } from "react";
import type { Title, WatchProgress } from "../types";
import { rememberFocus } from "../lib/spatialNav";
import { Poster } from "./Poster";

export type CardVariant = "standard" | "continue" | "top10" | "live";

interface CardProps {
  title: Title;
  group: string;
  variant?: CardVariant;
  rank?: number;
  progress?: WatchProgress;
  inList?: boolean;
  reason?: string;
  onOpen: (t: Title) => void;
}

export function metaLine(t: Title): string {
  const length = t.kind === "series" ? `${t.seasons ?? 1} season${(t.seasons ?? 1) > 1 ? "s" : ""}` : t.kind === "live" ? "Live" : `${Math.floor(t.runtimeMin / 60)}h ${t.runtimeMin % 60}m`;
  return [t.genres[0], length, t.rating].join(" · ");
}

export function liveStatus(t: Title, now = new Date()): { pct: number; leftMin: number } {
  const live = t.live!;
  // fake schedule that moves with the clock
  const elapsed = (live.startedMinAgo + now.getMinutes() % 10) % live.durationMin;
  return { pct: elapsed / live.durationMin, leftMin: Math.max(1, Math.round(live.durationMin - elapsed)) };
}

export function Card({ title: t, group, variant = "standard", rank, progress, inList, reason, onOpen }: CardProps): ReactElement {
  const live = t.kind === "live" ? liveStatus(t) : null;
  const label = [
    rank ? `Number ${rank} this week.` : "",
    t.name + ".",
    live ? `Live now on ${t.live!.channel}, ${live.leftMin} minutes left.` : metaLine(t) + ".",
    progress ? `${Math.round(progress.pct * 100)} percent watched, ${progress.label}.` : "",
    inList ? "In My List." : "",
    reason ?? "",
  ].filter(Boolean).join(" ");

  return (
    <div className={`card-wrap card-wrap--${variant}`}>
      {variant === "top10" && rank ? <span className="rank" aria-hidden="true">{rank}</span> : null}
      <button
        type="button"
        className={`card card--${variant}`}
        data-nav=""
        data-nav-group={group}
        aria-label={label}
        onFocus={(e) => rememberFocus(e.currentTarget)}
        onClick={() => onOpen(t)}
      >
        <span className="card__art">
          <Poster seed={t.id} art={t.art} className="card__svg" />
          <span className="card__scrim" />
          <span className="card__name">{t.name}</span>
          {live ? <span className="badge badge--live">Live</span> : null}
          {inList ? <span className="badge badge--list" aria-hidden="true">✓</span> : null}
          {progress ? (
            <span className="progress" aria-hidden="true"><span style={{ width: `${progress.pct * 100}%` }} /></span>
          ) : null}
          {live ? (
            <span className="progress progress--live" aria-hidden="true"><span style={{ width: `${live.pct * 100}%` }} /></span>
          ) : null}
        </span>
        <span className="card__meta" aria-hidden="true">
          {progress ? progress.label : live ? `${t.live!.channel} · ${live.leftMin} min left` : metaLine(t)}
        </span>
        {reason ? <span className="card__reason" aria-hidden="true">{reason}</span> : null}
      </button>
    </div>
  );
}

export function SkeletonCard(): ReactElement {
  return (
    <div className="card-wrap" aria-hidden="true">
      <div className="card card--skeleton">
        <span className="card__art shimmer" />
        <span className="card__meta"><span className="shimmer shimmer--line" /></span>
      </div>
    </div>
  );
}
