import { useId } from 'react';

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

const Sparkline = ({ data, color, width = 96, height = 32 }: SparklineProps) => {
  const id = useId();
  if (data.length < 2) return null;

  const max = Math.max(...data, 1);
  const step = width / (data.length - 1);
  const points = data.map((v, i) => [i * step, height - 2 - (v / max) * (height - 4)] as const);
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        className="animate-draw"
        style={{ ['--path-length' as string]: 1 }}
      />
    </svg>
  );
};

export default Sparkline;
