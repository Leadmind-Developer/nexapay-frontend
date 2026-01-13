"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import * as Recharts from "recharts";

// Helper to wrap named exports for dynamic import
function dynamicRecharts<T extends ComponentType<any>>(Component: T) {
  return dynamic(
    async () => {
      return {
        default: (props: any) => <Component {...props} />,
      };
    },
    { ssr: false }
  );
}

// Now export all components safely
export const ResponsiveContainer = dynamicRecharts(Recharts.ResponsiveContainer);
export const BarChart = dynamicRecharts(Recharts.BarChart);
export const Bar = dynamicRecharts(Recharts.Bar);
export const XAxis = dynamicRecharts(Recharts.XAxis);
export const YAxis = dynamicRecharts(Recharts.YAxis);
export const LineChart = dynamicRecharts(Recharts.LineChart);
export const Line = dynamicRecharts(Recharts.Line);
export const PieChart = dynamicRecharts(Recharts.PieChart);
export const Pie = dynamicRecharts(Recharts.Pie);
export const Cell = dynamicRecharts(Recharts.Cell);
export const Tooltip = dynamicRecharts(Recharts.Tooltip);
