// components/charts/RechartsClient.tsx
"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { PieProps, BarProps, LineProps, XAxisProps, YAxisProps, CellProps, TooltipProps, ResponsiveContainerProps } from "recharts";

// Generic dynamic loader for Recharts components
function dynamicChart<T extends object>(importFn: () => Promise<{ default: ComponentType<T> }>) {
  return dynamic(importFn, { ssr: false }) as ComponentType<T>;
}

// Charts
export const ResponsiveContainer = dynamicChart<ResponsiveContainerProps>(() =>
  import("recharts").then((m) => ({ default: m.ResponsiveContainer }))
);

export const PieChart = dynamicChart<{}>(() =>
  import("recharts").then((m) => ({ default: m.PieChart }))
);

export const Pie = dynamicChart<PieProps>(() =>
  import("recharts").then((m) => ({ default: m.Pie }))
);

export const Cell = dynamicChart<CellProps>(() =>
  import("recharts").then((m) => ({ default: m.Cell }))
);

export const Tooltip = dynamicChart<TooltipProps>(() =>
  import("recharts").then((m) => ({ default: m.Tooltip }))
);

export const BarChart = dynamicChart<BarProps>(() =>
  import("recharts").then((m) => ({ default: m.BarChart }))
);

export const Bar = dynamicChart<BarProps>(() =>
  import("recharts").then((m) => ({ default: m.Bar }))
);

export const XAxis = dynamicChart<XAxisProps>(() =>
  import("recharts").then((m) => ({ default: m.XAxis }))
);

export const YAxis = dynamicChart<YAxisProps>(() =>
  import("recharts").then((m) => ({ default: m.YAxis }))
);

export const LineChart = dynamicChart<LineProps>(() =>
  import("recharts").then((m) => ({ default: m.LineChart }))
);

export const Line = dynamicChart<LineProps>(() =>
  import("recharts").then((m) => ({ default: m.Line }))
);
