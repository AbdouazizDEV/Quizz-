import { useId, useMemo } from 'react';
import Svg, { Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { buildAreaUnderLinePath, buildSmoothLinePath, type ChartPoint } from '@utils/chartPath';

import { StatisticsTheme } from '@constants/statisticsTheme';

const Y_TICKS = [1000, 800, 600, 400, 200, 0];

interface WeeklyLineChartSvgProps {
  width: number;
  height: number;
  values: number[];
  yMax: number;
}

export function WeeklyLineChartSvg({ width, height, values, yMax }: WeeklyLineChartSvgProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `statFill_${uid}`;

  const { linePath, areaPath } = useMemo(() => {
    const n = values.length;
    if (n === 0 || width <= 0 || height <= 0) {
      return { linePath: '', areaPath: '' };
    }
    const padX = 4;
    const padY = 6;
    const innerW = Math.max(1, width - padX * 2);
    const innerH = Math.max(1, height - padY * 2);
    const bottomY = padY + innerH;

    const pts: ChartPoint[] = values.map((v, i) => {
      const x =
        n === 1 ? padX + innerW / 2 : padX + (i / (n - 1)) * innerW;
      const clamped = Math.min(yMax, Math.max(0, v));
      const y = padY + innerH - (clamped / yMax) * innerH;
      return { x, y };
    });

    return {
      linePath: buildSmoothLinePath(pts),
      areaPath: buildAreaUnderLinePath(pts, bottomY),
    };
  }, [values, width, height, yMax]);

  const gridLines = useMemo(() => {
    if (height <= 0) return [];
    const padY = 6;
    const innerH = Math.max(1, height - padY * 2);
    return Y_TICKS.filter((t) => t > 0 && t < yMax).map((t) => {
      const y = padY + innerH - (t / yMax) * innerH;
      return { y, key: t };
    });
  }, [height, yMax]);

  if (width <= 0 || height <= 0) {
    return null;
  }

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#A78BFA" stopOpacity={0.42} />
          <Stop offset="1" stopColor="#A78BFA" stopOpacity={0.04} />
        </LinearGradient>
      </Defs>
      {gridLines.map(({ y, key }) => (
        <Line
          key={key}
          x1={0}
          x2={width}
          y1={y}
          y2={y}
          stroke="#F0F0F0"
          strokeWidth={1}
        />
      ))}
      {areaPath ? <Path d={areaPath} fill={`url(#${gradId})`} /> : null}
      {linePath ? (
        <Path
          d={linePath}
          fill="none"
          stroke={StatisticsTheme.chartLine}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </Svg>
  );
}
