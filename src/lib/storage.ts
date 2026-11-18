// localStorage can throw in private mode / iframes so wrap it
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(`cue:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(`cue:${key}`, JSON.stringify(value));
  } catch {
    /* Not fatal: state just won't survive a reload. */
  }
}
