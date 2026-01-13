"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/* Helper to silence Recharts typing issues */
const dynamicChart = <T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>
) =>
  dynamic(loader, {
    ssr: false,
  });

export const ResponsiveContainer = dynamicChart(
  () => import("recharts").then(m => ({ default: m.ResponsiveContainer }))
);

export const PieChart = dynamicChart(
  () => import("recharts").then(m => ({ default: m.PieChart }))
);

export const Pie = dynamicChart(
  () => import("recharts").then(m => ({ default: m.Pie }))
);

export const Cell = dynamicChart(
  () => import("recharts").then(m => ({ default: m.Cell }))
);

export const Tooltip = dynamicChart(
  () => import("recharts").then(m => ({ default: m.Tooltip }))
);

export const BarChart = dynamicChart(
  () => import("recharts").then(m => ({ default: m.BarChart }))
);

export const Bar = dynamicChart(
  () => import("recharts").then(m => ({ default: m.Bar }))
);

export const XAxis = dynamicChart(
  () => import("recharts").then(m => ({ default: m.XAxis }))
);

export const YAxis = dynamicChart(
  () => import("recharts").then(m => ({ default: m.YAxis }))
);

export const LineChart = dynamicChart(
  () => import("recharts").then(m => ({ default: m.LineChart }))
);

export const Line = dynamicChart(
  () => import("recharts").then(m => ({ default: m.Line }))
);
