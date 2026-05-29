"use client";

import { useEffect, useRef, useState } from "react";
import { Area, AreaChart, Tooltip, XAxis, YAxis } from "recharts";

type EquityPoint = {
  date: string;
  equity: number;
};

type EquityChartProps = {
  data: EquityPoint[];
};

const CHART_HEIGHT = 320;

export default function EquityChart({ data }: EquityChartProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  const chartData =
    data && data.length > 0
      ? data.map((item) => ({
          ...item,
          equity: Number(item.equity.toFixed(2)),
        }))
      : [
          {
            date: "No trades",
            equity: 0,
          },
        ];

  useEffect(() => {
    const element = wrapperRef.current;

    if (!element) return;

    const updateWidth = () => {
      setWidth(Math.max(element.clientWidth, 1));
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative h-[320px] min-h-[320px] w-full min-w-0 overflow-hidden"
    >
      {width > 0 ? (
        <AreaChart
          width={width}
          height={CHART_HEIGHT}
          data={chartData}
          margin={{
            top: 10,
            right: 12,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.22} />

              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
            tickFormatter={(value) => Number(value).toFixed(2)}
          />

          <Tooltip formatter={(value) => Number(value).toFixed(2)} />

          <Area
            type="monotone"
            dataKey="equity"
            stroke="var(--accent)"
            strokeWidth={3}
            fill="url(#equityFill)"
          />
        </AreaChart>
      ) : null}
    </div>
  );
}
