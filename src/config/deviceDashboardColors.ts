/**
 * Paleta kategorii — kolory rozłożone równomiernie na kole barw (bez par typu fiolet/indigo, błękit/turkus).
 * Indeks kategorii mapuje się cyklicznie (index % length).
 */
export const CATEGORY_COLORS = [
  { bar: 'bg-rose-600', text: 'text-rose-600' },
  { bar: 'bg-orange-600', text: 'text-orange-600' },
  { bar: 'bg-yellow-500', text: 'text-yellow-500' },
  { bar: 'bg-lime-600', text: 'text-lime-600' },
  { bar: 'bg-green-600', text: 'text-green-600' },
  { bar: 'bg-cyan-600', text: 'text-cyan-600' },
  { bar: 'bg-blue-600', text: 'text-blue-600' },
  { bar: 'bg-violet-600', text: 'text-violet-600' },
  { bar: 'bg-fuchsia-600', text: 'text-fuchsia-600' },
  { bar: 'bg-pink-600', text: 'text-pink-600' },
  { bar: 'bg-amber-700', text: 'text-amber-700' },
  { bar: 'bg-slate-500', text: 'text-slate-500' },
] as const;

/** Kolory linii wykresu kosztów (Chart.js) — te same odcienie co CATEGORY_COLORS. */
export const CHART_LINE_COLORS = [
  { border: '#e11d48', bg: 'rgba(225, 29, 72, 0.15)' },
  { border: '#ea580c', bg: 'rgba(234, 88, 12, 0.15)' },
  { border: '#eab308', bg: 'rgba(234, 179, 8, 0.15)' },
  { border: '#65a30d', bg: 'rgba(101, 163, 13, 0.15)' },
  { border: '#16a34a', bg: 'rgba(22, 163, 74, 0.15)' },
  { border: '#0891b2', bg: 'rgba(8, 145, 178, 0.15)' },
  { border: '#2563eb', bg: 'rgba(37, 99, 235, 0.15)' },
  { border: '#7c3aed', bg: 'rgba(124, 58, 237, 0.15)' },
  { border: '#c026d3', bg: 'rgba(192, 38, 211, 0.15)' },
  { border: '#db2777', bg: 'rgba(219, 39, 119, 0.15)' },
  { border: '#b45309', bg: 'rgba(180, 83, 9, 0.15)' },
  { border: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' },
] as const;
