import { useId, type ReactElement } from "react";
import type { Artwork } from "../types";

// seeded random so each title's art stays the same
function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

interface PosterProps {
  seed: string;
  art: Artwork;
  className?: string;
}

// generated poster art (no image files). swap this out for real art later
export function Poster({ seed, art, className }: PosterProps): ReactElement {
  const uid = useId().replace(/:/g, "");
  const rnd = seeded(seed);
  const a = `hsl(${art.hue} 62% 20%)`;
  const b = `hsl(${art.hue2} 72% 46%)`;
  const ink = `hsl(${art.hue} 70% 8%)`;
  const glow = `hsl(${art.hue2} 90% 70%)`;
  const shapes: ReactElement[] = [];

  switch (art.motif) {
    case "orbit": {
      const cx = 200 + rnd() * 60, cy = 70 + rnd() * 30;
      for (let i = 0; i < 4; i++) shapes.push(<ellipse key={i} cx={cx} cy={cy} rx={40 + i * 34} ry={16 + i * 13} fill="none" stroke={glow} strokeOpacity={0.5 - i * 0.1} strokeWidth={1.4} transform={`rotate(-18 ${cx} ${cy})`} />);
      shapes.push(<circle key="p" cx={cx} cy={cy} r={22} fill={b} />);
      shapes.push(<circle key="m" cx={cx - 96} cy={cy + 28} r={5} fill={glow} />);
      break;
    }
    case "stripes":
      for (let i = 0; i < 9; i++) shapes.push(<rect key={i} x={-40 + i * 46} y={-40} width={14 + rnd() * 16} height={300} fill={i % 3 ? b : glow} opacity={0.18 + rnd() * 0.4} transform="rotate(24 160 90)" />);
      break;
    case "horizon":
      shapes.push(<circle key="s" cx={210} cy={112} r={58} fill={glow} opacity={0.9} />);
      for (let i = 0; i < 5; i++) shapes.push(<rect key={i} x={0} y={112 + i * 9} width={320} height={4 + i} fill={ink} />);
      shapes.push(<rect key="g" x={0} y={150} width={320} height={30} fill={ink} />);
      break;
    case "grid":
      for (let i = 0; i <= 12; i++) shapes.push(<line key={`v${i}`} x1={160} y1={70} x2={-120 + i * 47} y2={180} stroke={glow} strokeOpacity={0.35} />);
      for (let i = 0; i < 6; i++) shapes.push(<line key={`h${i}`} x1={0} x2={320} y1={90 + i * i * 3.2} y2={90 + i * i * 3.2} stroke={glow} strokeOpacity={0.3} />);
      shapes.push(<rect key="hz" x={0} y={0} width={320} height={72} fill={ink} opacity={0.55} />);
      break;
    case "waves":
      for (let i = 0; i < 7; i++) {
        const y = 70 + i * 16, amp = 6 + rnd() * 10, ph = rnd() * 80;
        let d = `M -10 ${y}`;
        for (let x = 0; x <= 340; x += 20) d += ` L ${x} ${(y + Math.sin((x + ph) / 28) * amp).toFixed(1)}`;
        shapes.push(<path key={i} d={d} fill="none" stroke={i % 2 ? glow : b} strokeOpacity={0.75 - i * 0.07} strokeWidth={2.2} />);
      }
      break;
    case "rings": {
      const cx = 230 + rnd() * 40, cy = 60 + rnd() * 50;
      for (let i = 6; i > 0; i--) shapes.push(<circle key={i} cx={cx} cy={cy} r={i * 22} fill={i % 2 ? b : a} opacity={0.35 + i * 0.06} />);
      shapes.push(<circle key="c" cx={cx} cy={cy} r={14} fill={glow} />);
      break;
    }
    case "blocks":
      for (let i = 0; i < 14; i++) {
        const w = 18 + rnd() * 56;
        shapes.push(<rect key={i} x={130 + rnd() * 200} y={rnd() * 170 - 20} width={w} height={w} rx={w * 0.3} fill={i % 3 ? b : glow} opacity={0.25 + rnd() * 0.55} transform={`rotate(${rnd() * 40 - 20} 220 90)`} />);
      }
      break;
    case "beam":
      shapes.push(<polygon key="b" points={`250,40 -20,${10 + rnd() * 20} -20,${120 + rnd() * 40}`} fill={`url(#beam-${uid})`} />);
      shapes.push(<rect key="t" x={244} y={40} width={16} height={140} fill={ink} />);
      shapes.push(<circle key="l" cx={252} cy={40} r={9} fill={glow} />);
      break;
  }

  return (
    <svg className={className} viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <linearGradient id={`beam-${uid}`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor={glow} stopOpacity="0.85" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#bg-${uid})`} />
      {shapes}
    </svg>
  );
}
