export interface ChartPoint {
  x: number;
  y: number;
}

/** Courbe lisse type Bézier cubique entre les points (approximation maillage). */
export function buildSmoothLinePath(points: ChartPoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const c1x = p0.x + (p1.x - p0.x) / 3;
    const c1y = p0.y;
    const c2x = p1.x - (p1.x - p0.x) / 3;
    const c2y = p1.y;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

/** Zone sous la courbe fermée jusqu’à la baseline. */
export function buildAreaUnderLinePath(points: ChartPoint[], bottomY: number): string {
  if (points.length === 0) return '';
  const line = buildSmoothLinePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
}
