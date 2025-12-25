"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ================= TYPES ================= */
interface Transaction {
  amount: number;
  [key: string]: any; // optional extra fields
}

interface SavingsProgressChartProps {
  transactions: Transaction[];
  target: number;
}

interface ChartDataPoint {
  day: number;
  amount: number;
}

/* ================= COMPONENT ================= */
export default function SavingsProgressChart({
  transactions,
  target,
}: SavingsProgressChartProps) {
  const data: ChartDataPoint[] = transactions.map((t, i) => ({
    day: i + 1,
    amount: t.amount,
  }));

  return (
    <div className="h-64 bg-white rounded-xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-sm mt-2 text-gray-500">
        Target: ₦{target.toLocaleString()}
      </p>
    </div>
  );
}
