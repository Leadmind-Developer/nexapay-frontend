"use client";
import useSWR from "swr";
import axios from "axios";

const fetcher = (u: string) => axios.get(u).then(r => r.data);

export default function WebhooksPage() {
  const { data, error } = useSWR("/api/webhooks", fetcher, { refreshInterval: 3000 });

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Webhook Events</h2>
      {error && <div className="text-red-500">Failed to load</div>}
      {!data && <div>Loading...</div>}
      {data && data.map((w: any) => (
        <div key={w.id} className="bg-white dark:bg-gray-800 p-3 rounded mb-3">
          <div className="flex justify-between">
            <div><strong>{w.platform ?? 'unknown'}</strong> — {w.event ?? w.type ?? 'event'}</div>
            <div className="text-sm text-gray-500">{new Date(w.created_at || Date.now()).toLocaleString()}</div>
          </div>
          <pre className="mt-2 bg-gray-50 dark:bg-gray-900 p-2 rounded text-sm overflow-auto">{JSON.stringify(w.payload ?? w.body ?? w, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}
