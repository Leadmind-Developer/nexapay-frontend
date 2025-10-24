import React, { useState } from 'react';
import SEO from "@/components/SEO";
import { initiateBulk } from "@/lib/api";

export default function BulkPage() {
  const [csvText, setCsvText] = useState('reference,amount,recipient\n');
  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResp(null);
    try {
      // Expect CSV; backend should accept CSV or parsed JSON
      const payload = { csv: csvText };
      const r = await initiateBulk(payload);
      setResp(r);
    } catch (err: any) {
      setResp({ error: err.response?.data ?? err.message });
    }
    setLoading(false);
  }

  return (
    <>
      <SEO title="Enterprise Bulk" />
      <h2>Enterprise Bulk Transactions</h2>
      <form className="form" onSubmit={submit}>
        <label>CSV (reference,amount,recipient)</label>
        <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={10} />
        <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Initiate Bulk'}</button>
      </form>

      {resp && <pre className="result">{JSON.stringify(resp, null, 2)}</pre>}
    </>
  );
}
