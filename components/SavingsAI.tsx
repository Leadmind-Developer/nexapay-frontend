"use client";

type Tip = {
  message: string;
};

export default function SavingsAI({ tips }: { tips: Tip[] }) {
  if (!tips || tips.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-2">Smart Savings Tips</h3>

      <ul className="space-y-1 text-sm text-gray-600">
        {tips.map((t, i) => (
          <li key={i}>• {t.message}</li>
        ))}
      </ul>
    </div>
  );
}
