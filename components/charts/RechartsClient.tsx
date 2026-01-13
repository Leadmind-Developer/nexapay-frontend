// components/charts/BudgetCharts.tsx
"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import type { CategoryChartItem, TrendPoint, PieItem } from "@/types";

interface ChartsProps {
  categoryData: CategoryChartItem[];
  trendData: TrendPoint[];
  pieData: PieItem[];
}

export default function BudgetCharts({ categoryData, trendData, pieData }: ChartsProps) {
  const COLORS = ["#4B7BE5", "#F59E0B", "#10B981", "#EF4444", "#6366F1"];

  return (
    <div className="space-y-8">
      {/* Bar Chart */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="font-semibold mb-4">Budget vs Actual</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="budget" fill="#CBD5E1" />
            <Bar dataKey="spent" fill="#4B7BE5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="font-semibold mb-4">Spending Trend (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#4B7BE5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="font-semibold mb-4">Spending Distribution</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
