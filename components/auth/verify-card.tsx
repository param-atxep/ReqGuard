"use client";
import React, { useState } from 'react';

export default function VerifyCard({ token, email }: { token?: string; email?: string }) {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, email }) });
      if (res.ok) setOk(true);
      else {
        const d = await res.json();
        setError(d?.error || 'Verification failed');
      }
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally { setLoading(false); }
  }

  if (ok) return <div className="p-6 text-center"><h3 className="text-lg text-white font-semibold">Email verified</h3><p className="text-zinc-400 mt-2">You can now <a href="/login" className="text-[#F5C451]">login</a>.</p></div>;

  return (
    <div className="p-6">
      <h3 className="text-lg text-white font-semibold">Verify your email</h3>
      <p className="text-zinc-400 mt-2">Click the button to verify your email address.</p>
      {error && <div className="text-sm text-red-400 mt-2">{error}</div>}
      <div className="mt-4">
        <button className="py-2 px-4 rounded-lg bg-[#F5C451] text-black font-semibold" onClick={confirm} disabled={loading}>{loading ? 'Verifying...' : 'Verify Email'}</button>
      </div>
    </div>
  );
}
