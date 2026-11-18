import { useEffect, useRef, useState, type FormEvent, type ReactElement } from "react";
import type { CueApi, DiscoverRequest, DiscoverResult, ProtoSettings, Title } from "../types";
import { byId } from "../data/catalog";
import { Card, SkeletonCard } from "./Card";

export const SUGGESTIONS = [
  "Something funny under 30 minutes",
  "A slow-burn mystery for a rainy night",
  "What can I watch with my kids?",
  "Like Fault Lines but less dark",
];

const REFINEMENTS: Array<{ label: string; add: string }> = [
  { label: "Shorter", add: "under 30 minutes" },
  { label: "Lighter", add: "less dark, feel-good" },
  { label: "Movies only", add: "movies" },
  { label: "Series only", add: "series" },
];

interface AskPromptProps {
  onAsk: (query: string) => void;
  compact?: boolean;
  initial?: string;
  busy?: boolean;
  aiMode: "ai" | "offline" | "checking";
}

export function AskPrompt({ onAsk, compact, initial = "", busy, aiMode }: AskPromptProps): ReactElement {
  const [value, setValue] = useState(initial);
  useEffect(() => setValue(initial), [initial]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onAsk(value.trim());
  };
  return (
    <div className={`ask ${compact ? "ask--compact" : ""}`}>
      <form className="ask__form" onSubmit={submit} role="search">
        <label htmlFor={compact ? "ask-home" : "ask-page"} className="ask__label">
          {compact ? "Not sure what to watch? Ask Cue." : "Describe what you're in the mood for"}
        </label>
        <div className="ask__row">
          <input
            id={compact ? "ask-home" : "ask-page"}
            className="ask__input"
            data-nav=""
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. a tense movie under two hours"
            autoComplete="off"
            enterKeyHint="search"
          />
          <button type="submit" className="btn btn--primary" data-nav="" disabled={busy || !value.trim()}>
            {busy ? "Thinking…" : "Ask"}
          </button>
        </div>
      </form>
      <div className="chips" role="group" aria-label="Example requests">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" className="chip" data-nav="" data-nav-group={compact ? "ask-chips-home" : "ask-chips"} onClick={() => { setValue(s); onAsk(s); }}>
            {s}
          </button>
        ))}
      </div>
      <p className="ask__mode">
        <span className={`mode-dot mode-dot--${aiMode}`} aria-hidden="true" />
        {aiMode === "ai" ? "Answers come from AI and only include titles in Cue's catalog." : aiMode === "checking" ? "Connecting to the AI…" : "AI isn't connected here, so Cue uses offline keyword matching."}
      </p>
    </div>
  );
}

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string } | { kind: "ready"; result: DiscoverResult };

interface AskPageProps {
  api: CueApi;
  settings: ProtoSettings;
  catalog: Title[];
  query: string;
  aiMode: "ai" | "offline" | "checking";
  inList: (id: string) => boolean;
  onOpen: (t: Title) => void;
  onAsk: (q: string) => void;
}

export function AskPage({ api, settings, catalog, query, aiMode, inList, onOpen, onAsk }: AskPageProps): ReactElement {
  const [removed, setRemoved] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [attempt, setAttempt] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => setRemoved([]), [query]);

  useEffect(() => {
    if (!query) { setStatus({ kind: "idle" }); return; }
    const ctrl = new AbortController();
    const req: DiscoverRequest = { query, removed };
    setStatus({ kind: "loading" });
    api.discover(req, settings, ctrl.signal)
      .then((result) => setStatus({ kind: "ready", result }))
      .catch((err: Error) => { if (err.name !== "AbortError") setStatus({ kind: "error", message: err.message }); });
    return () => ctrl.abort();
    // don't re-ask when latency changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, query, removed, attempt]);

  useEffect(() => {
    if (status.kind === "ready") headingRef.current?.focus({ preventScroll: true });
  }, [status.kind]);

  const picks = status.kind === "ready"
    ? status.result.picks.map((p) => ({ t: byId(catalog, p.id), reason: p.reason })).filter((p): p is { t: Title; reason: string } => !!p.t)
    : [];

  return (
    <div className="page page--ask">
      <header className="page__head">
        <p className="eyebrow">Ask Cue</p>
        <h1 className="page__title">What should I watch?</h1>
      </header>
      <AskPrompt onAsk={onAsk} initial={query} busy={status.kind === "loading"} aiMode={aiMode} />

      <div className="ask__results" aria-live="polite">
        {status.kind === "loading" ? (
          <>
            <p className="status-line">Looking through {catalog.filter((t) => t.kind !== "live").length} titles for “{query}”…</p>
            <ul className="grid">{Array.from({ length: 4 }, (_, i) => <li key={i}><SkeletonCard /></li>)}</ul>
          </>
        ) : status.kind === "error" ? (
          <div className="rail__error" role="alert">
            <p><strong>Cue couldn't get recommendations.</strong> {status.message}</p>
            <button type="button" className="btn btn--ghost" data-nav="" onClick={() => setAttempt((a) => a + 1)}>Try again</button>
          </div>
        ) : status.kind === "ready" ? (
          <>
            <div className="ask__summary">
              <h2 className="ask__heading" tabIndex={-1} ref={headingRef}>{status.result.heading}</h2>
              {status.result.note ? <p className="status-line">{status.result.note}</p> : null}
              {status.result.understood.length ? (
                <div className="understood">
                  <span className="understood__label">Understood as</span>
                  <ul className="chips">
                    {status.result.understood.map((u) => (
                      <li key={u}>
                        <button type="button" className="chip chip--removable" data-nav="" data-nav-group="understood" aria-label={`Remove “${u}” and ask again`} onClick={() => setRemoved((r) => [...r, u])}>
                          {u} <span aria-hidden="true">✕</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {picks.length ? (
              <ul className="grid grid--results">
                {picks.map(({ t, reason }) => (
                  <li key={t.id}><Card title={t} group="ask-results" inList={inList(t.id)} reason={reason} onOpen={onOpen} /></li>
                ))}
              </ul>
            ) : (
              <div className="empty">
                <p className="empty__title">Nothing in Cue matches all of that.</p>
                <p>Remove one of the filters above, or try one of the refinements below.</p>
              </div>
            )}

            <div className="chips refine" role="group" aria-label="Refine these results">
              <span className="understood__label">Refine</span>
              {REFINEMENTS.map((r) => (
                <button key={r.label} type="button" className="chip" data-nav="" data-nav-group="refine" onClick={() => onAsk(`${query}, ${r.add}`)}>
                  {r.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="status-line">Try one of the examples, or describe a mood, a time limit, or a title you liked.</p>
        )}
      </div>
    </div>
  );
}
