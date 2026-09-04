"use client";
import React from 'react';

export default function OAuthButtons() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <a href="/api/auth/signin/google?callbackUrl=%2Fdashboard" className="flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-black text-sm font-medium text-white transition hover:border-zinc-600">
        <img src="/icons/google.svg" alt="" className="h-5 w-5" /> Google
      </a>
      <a href="/api/auth/signin/github?callbackUrl=%2Fdashboard" className="flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-black text-sm font-medium text-white transition hover:border-zinc-600">
        <img src="/icons/github.svg" alt="" className="h-5 w-5 invert" /> GitHub
      </a>
    </div>
  );
}
