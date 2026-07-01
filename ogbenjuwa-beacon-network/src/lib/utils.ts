import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Ogbenjuwa Utility Functions ─────────────────────────────────────────

/** Promise-based delay */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Small random GPS offset for privacy/simulation */
export function jitter(coord: number, amount = 0.005): number {
  return coord + (Math.random() - 0.5) * amount;
}

/** Random float between a and b */
export function randomBetween(a: number, b: number): number {
  return Math.random() * (b - a) + a;
}

/** Milliseconds → "M:SS.d" format (for alert timer) */
export function formatTimer(ms: number): string {
  const s = Math.floor(ms / 1000);
  const ds = Math.floor((ms % 1000) / 100);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}.${ds}`;
}

/** Milliseconds → "Xm Ys" format */
export function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

/** Fuzzy name matching score (0–1) by character overlap */
export function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().replace(/\s+/g, '');
  const t = target.toLowerCase().replace(/\s+/g, '');
  if (q.length === 0) return 0;

  let matches = 0;
  let tIdx = 0;
  for (let i = 0; i < q.length && tIdx < t.length; i++) {
    if (q[i] === t[tIdx]) {
      matches++;
      tIdx++;
    } else {
      // Skip non-matching chars in target
      while (tIdx < t.length && q[i] !== t[tIdx]) tIdx++;
      if (tIdx < t.length) {
        matches++;
        tIdx++;
      }
    }
  }
  return matches / Math.max(q.length, t.length);
}

/** Generate REU-XXXX reunion code */
export function generateReunionCode(): string {
  return 'REU-' + Math.floor(1000 + Math.random() * 9000);
}

/** Response time string → colour hex */
export function responseTimeColor(timeStr: string): string {
  const [m, s] = timeStr.split(':').map(Number);
  const totalSec = m * 60 + (s || 0);
  if (totalSec <= 120) return '#22C55E'; // green — under 2 min
  if (totalSec <= 150) return '#F59E0B'; // amber — 2–2:30
  return '#EF4444'; // red — over 2:30
}

/** Generate a random demo phone number */
export function randomPhone(): string {
  const prefixes = ['803', '805', '806', '807', '808', '809', '810', '812', '813', '814', '815', '816', '817', '818', '819', '902', '903', '905', '906', '907', '908', '909'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = String(Math.floor(10000000 + Math.random() * 90000000));
  return `+234 ${prefix} ${suffix.slice(0, 3)} ${suffix.slice(3)}`;
}
