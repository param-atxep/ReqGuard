"use client";
import React from 'react';

function scorePassword(pw: string) {
  let score = 0;
  if (!pw) return 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-5
}

export default function PasswordStrength({ password }: { password: string }) {
  const score = scorePassword(password);
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Enterprise'];
  const colors = ['#ef4444', '#f97316', '#fbbf24', '#10b981', '#F5C451'];

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden" style={{ boxShadow: 'inset 0 0 6px rgba(0,0,0,0.6)' }}>
          <div style={{ width: `${(score / 5) * 100}%`, height: '100%', background: colors[Math.max(0, score - 1)] || '#111' }} />
        </div>
        <div className="text-xs text-zinc-400 w-28 text-right">{password ? labels[Math.max(0, score - 1)] : 'Enter password'}</div>
      </div>
      <div className="text-xs text-zinc-500">
        <div className="flex gap-2 flex-wrap">
          <div className={`px-2 py-1 rounded text-[11px] ${password.length >= 8 ? 'bg-green-900/30 text-green-300' : 'bg-zinc-900/30'}`}>Min 8 chars</div>
          <div className={`px-2 py-1 rounded text-[11px] ${/[A-Z]/.test(password) ? 'bg-green-900/30 text-green-300' : 'bg-zinc-900/30'}`}>Uppercase</div>
          <div className={`px-2 py-1 rounded text-[11px] ${/[a-z]/.test(password) ? 'bg-green-900/30 text-green-300' : 'bg-zinc-900/30'}`}>Lowercase</div>
          <div className={`px-2 py-1 rounded text-[11px] ${/\d/.test(password) ? 'bg-green-900/30 text-green-300' : 'bg-zinc-900/30'}`}>Number</div>
          <div className={`px-2 py-1 rounded text-[11px] ${/[^A-Za-z0-9]/.test(password) ? 'bg-green-900/30 text-green-300' : 'bg-zinc-900/30'}`}>Special</div>
        </div>
      </div>
    </div>
  );
}
