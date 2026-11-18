// arrow key navigation for TV/keyboard
// anything with data-nav can get focus. items in the same row share data-nav-group
// so when you come back to a row you land on the card you left, not the closest one

export type Direction = "up" | "down" | "left" | "right";

const KEY_TO_DIR: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

const lastInGroup = new Map<string, HTMLElement>();

export function rememberFocus(el: HTMLElement): void {
  const group = el.dataset.navGroup;
  if (group) lastInGroup.set(group, el);
}

function isUsable(el: HTMLElement): boolean {
  if (el.hasAttribute("disabled") || el.getAttribute("aria-hidden") === "true") return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

function center(r: DOMRect): { x: number; y: number } {
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function findNext(current: HTMLElement, dir: Direction, scope: ParentNode): HTMLElement | null {
  const items = Array.from(scope.querySelectorAll<HTMLElement>("[data-nav]")).filter((el) => el !== current && isUsable(el));
  const cr = current.getBoundingClientRect();
  const c = center(cr);
  const horizontal = dir === "left" || dir === "right";

  const candidates = items
    .map((el) => {
      const r = el.getBoundingClientRect();
      const p = center(r);
      let gap: number;
      switch (dir) {
        case "right": gap = r.left - cr.right; if (p.x <= c.x + 1) return null; break;
        case "left": gap = cr.left - r.right; if (p.x >= c.x - 1) return null; break;
        case "down": gap = r.top - cr.bottom; if (p.y <= c.y + 1) return null; break;
        case "up": gap = cr.top - r.bottom; if (p.y >= c.y - 1) return null; break;
      }
      const overlap = horizontal
        ? Math.min(r.bottom, cr.bottom) - Math.max(r.top, cr.top)
        : Math.min(r.right, cr.right) - Math.max(r.left, cr.left);
      const offAxis = horizontal ? Math.abs(p.y - c.y) : Math.abs(p.x - c.x);
      return { el, gap: Math.max(0, gap), overlap, offAxis };
    })
    .filter((x): x is { el: HTMLElement; gap: number; overlap: number; offAxis: number } => x !== null);

  if (!candidates.length) return null;

  let best: HTMLElement;
  if (horizontal) {
    // stay in the same row if possible
    const inRow = candidates.filter((x) => x.overlap > 0);
    const pool = inRow.length ? inRow : candidates;
    pool.sort((a, b) => a.gap + a.offAxis * 2 - (b.gap + b.offAxis * 2));
    best = pool[0].el;
  } else {
    // only move one row, then pick the closest item in it
    const nearestGap = Math.min(...candidates.map((x) => x.gap));
    const band = candidates.filter((x) => x.gap <= nearestGap + 24);
    band.sort((a, b) => a.offAxis - b.offAxis);
    best = band[0].el;
    const group = best.dataset.navGroup;
    const remembered = group ? lastInGroup.get(group) : undefined;
    if (remembered && remembered.isConnected && isUsable(remembered) && group !== current.dataset.navGroup) {
      best = remembered;
    }
  }
  return best;
}

export interface SpatialNavOptions {
  scope: () => ParentNode | null;
  onBack: () => void;
  reducedMotion: boolean;
}

// arrows move, esc/backspace go back
export function createKeyHandler(opts: SpatialNavOptions): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    const typing = !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

    if (e.key === "Escape" || (e.key === "Backspace" && !typing)) {
      e.preventDefault();
      opts.onBack();
      return;
    }

    const dir = KEY_TO_DIR[e.key];
    if (!dir) return;
    // in a text field left/right should still move the cursor
    if (typing && (dir === "left" || dir === "right")) return;

    const scope = opts.scope();
    if (!scope) return;
    e.preventDefault();
    move(dir, scope, opts.reducedMotion);
  };
}

export function move(dir: Direction, scope: ParentNode, reducedMotion: boolean): void {
  const active = document.activeElement as HTMLElement | null;
  const inScope = active && (scope as Node).contains(active) && active.hasAttribute("data-nav");
  const next = inScope ? findNext(active!, dir, scope) : scope.querySelector<HTMLElement>("[data-nav-default]") ?? scope.querySelector<HTMLElement>("[data-nav]");
  if (!next) return;
  next.focus({ preventScroll: true });
  next.scrollIntoView({
    block: dir === "up" || dir === "down" ? "center" : "nearest",
    inline: "nearest",
    behavior: reducedMotion ? "auto" : "smooth",
  });
}
