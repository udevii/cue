import { useRef, type ReactElement, type ReactNode } from "react";
import type { Title, WatchProgress } from "../types";
import { Card, SkeletonCard, type CardVariant } from "./Card";

export type RailState =
  | { status: "loading" }
  | { status: "error"; message: string; onRetry: () => void }
  | { status: "ready"; items: Title[] };

interface RailProps {
  id: string;
  heading: string;
  subheading?: string;
  state: RailState;
  variant?: CardVariant;
  progressFor?: (id: string) => WatchProgress | undefined;
  inList: (id: string) => boolean;
  onOpen: (t: Title) => void;
  empty?: ReactNode;
}

export function Rail({ id, heading, subheading, state, variant = "standard", progressFor, inList, onOpen, empty }: RailProps): ReactElement | null {
  const scroller = useRef<HTMLUListElement>(null);
  const headingId = `rail-${id}`;

  if (state.status === "ready" && state.items.length === 0 && !empty) return null;

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="rail" aria-labelledby={headingId} aria-busy={state.status === "loading"}>
      <div className="rail__head">
        <h2 id={headingId} className="rail__title">{heading}</h2>
        {subheading ? <p className="rail__sub">{subheading}</p> : null}
        {state.status === "ready" && state.items.length > 4 ? (
          <div className="rail__pager">
            <button type="button" className="icon-btn" aria-label={`Scroll ${heading} back`} onClick={() => page(-1)}>‹</button>
            <button type="button" className="icon-btn" aria-label={`Scroll ${heading} forward`} onClick={() => page(1)}>›</button>
          </div>
        ) : null}
      </div>

      {state.status === "error" ? (
        <div className="rail__error" role="alert">
          <p><strong>We couldn't load {heading}.</strong> {state.message}</p>
          <button type="button" className="btn btn--ghost" data-nav="" onClick={state.onRetry}>Try again</button>
        </div>
      ) : state.status === "ready" && state.items.length === 0 ? (
        <div className="rail__empty">{empty}</div>
      ) : (
        <ul className={`rail__list rail__list--${variant}`} ref={scroller}>
          {state.status === "loading"
            ? Array.from({ length: 6 }, (_, i) => <li key={i}><SkeletonCard /></li>)
            : state.items.map((t, i) => (
                <li key={t.id}>
                  <Card
                    title={t}
                    group={id}
                    variant={variant}
                    rank={variant === "top10" ? i + 1 : undefined}
                    progress={progressFor?.(t.id)}
                    inList={inList(t.id)}
                    onOpen={onOpen}
                  />
                </li>
              ))}
        </ul>
      )}
    </section>
  );
}
