"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function SavingsProgressChart({ transactions, target }) {
  const data = transactions.map((t, i) => ({
    day: i + 1,
    amount: t.amount
  }));

  return (
    <div className="h-64 bg-white rounded-xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line dataKey="amount" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-sm mt-2 text-gray-500">
        Target: ₦{target.toLocaleString()}
      </p>
    </div>
  );
}
