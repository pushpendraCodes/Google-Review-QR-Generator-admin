import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const CountUp = ({ value, format = (n) => Math.round(n).toLocaleString('en-IN'), duration = 900 }: CountUpProps) => {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const next = from + (value - from) * easeOutCubic(progress);
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = value;
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{format(display)}</>;
};

export default CountUp;
