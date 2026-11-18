import type { MouseEvent as ReactMouseEvent, ReactElement } from "react";
import type { Device, ProtoSettings } from "../types";
import type { Direction } from "../lib/spatialNav";

interface PanelProps {
  open: boolean;
  device: Device;
  settings: ProtoSettings;
  aiMode: "ai" | "offline" | "checking";
  onToggle: () => void;
  onDevice: (d: Device) => void;
  onSettings: (s: ProtoSettings) => void;
  onReset: () => void;
}

const LATENCIES = [
  { ms: 0, label: "Instant" },
  { ms: 700, label: "Typical" },
  { ms: 2500, label: "Slow 3G" },
];

// controls for testing, kept outside the app so people don't think it's part of it
export function ProtoPanel({ open, device, settings, aiMode, onToggle, onDevice, onSettings, onReset }: PanelProps): ReactElement {
  return (
    <div className="proto" data-nav-ignore="">
      <button type="button" className="proto__toggle" aria-expanded={open} aria-controls="proto-panel" onClick={onToggle}>
        {open ? "Close controls" : "Prototype controls"}
      </button>
      {open ? (
        <div id="proto-panel" className="proto__panel" role="region" aria-label="Prototype controls">
          <fieldset>
            <legend>Device</legend>
            <div className="seg">
              {(["web", "mobile", "tv"] as Device[]).map((d) => (
                <button key={d} type="button" aria-pressed={device === d} onClick={() => onDevice(d)}>
                  {d === "tv" ? "TV" : d === "web" ? "Web" : "Mobile"}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Network</legend>
            <div className="seg">
              {LATENCIES.map((l) => (
                <button key={l.ms} type="button" aria-pressed={settings.latencyMs === l.ms} onClick={() => onSettings({ ...settings, latencyMs: l.ms })}>
                  {l.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>States to review</legend>
            <label className="check">
              <input type="checkbox" checked={settings.failTrending} onChange={(e) => onSettings({ ...settings, failTrending: e.target.checked })} />
              Make the Trending service fail
            </label>
            <label className="check">
              <input type="checkbox" checked={settings.reducedMotion} onChange={(e) => onSettings({ ...settings, reducedMotion: e.target.checked })} />
              Reduce motion
            </label>
          </fieldset>
          <p className="proto__ai">
            AI: {aiMode === "ai" ? "connected" : aiMode === "checking" ? "checking…" : "offline matching"}
          </p>
          <button type="button" className="proto__reset" onClick={onReset}>Reset My List and progress</button>
          <p className="proto__hint">Arrow keys move focus. Enter selects. Esc or Backspace goes back.</p>
        </div>
      ) : null}
    </div>
  );
}

interface RemoteProps {
  onMove: (d: Direction) => void;
  onOk: () => void;
  onBack: () => void;
  onHide: () => void;
}

// on screen remote for testing TV mode with a mouse
export function Remote({ onMove, onOk, onBack, onHide }: RemoteProps): ReactElement {
  // don't let the remote buttons take focus
  const hold = (e: ReactMouseEvent) => e.preventDefault();
  return (
    <div className="remote" data-nav-ignore="" role="group" aria-label="On-screen remote">
      <div className="remote__pad">
        <button type="button" tabIndex={-1} className="remote__up" aria-label="Up" onMouseDown={hold} onClick={() => onMove("up")}>▲</button>
        <button type="button" tabIndex={-1} className="remote__left" aria-label="Left" onMouseDown={hold} onClick={() => onMove("left")}>◀</button>
        <button type="button" tabIndex={-1} className="remote__ok" aria-label="OK" onMouseDown={hold} onClick={onOk}>OK</button>
        <button type="button" tabIndex={-1} className="remote__right" aria-label="Right" onMouseDown={hold} onClick={() => onMove("right")}>▶</button>
        <button type="button" tabIndex={-1} className="remote__down" aria-label="Down" onMouseDown={hold} onClick={() => onMove("down")}>▼</button>
      </div>
      <div className="remote__row">
        <button type="button" tabIndex={-1} onMouseDown={hold} onClick={onBack}>Back</button>
        <button type="button" tabIndex={-1} onMouseDown={hold} onClick={onHide}>Hide</button>
      </div>
    </div>
  );
}
