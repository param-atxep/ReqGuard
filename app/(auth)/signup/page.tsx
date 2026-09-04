import React from 'react';
import SignupForm from '../../../components/auth/signup-form';
import { redirectIfAuthenticated } from '../../../lib/session';

export const dynamic = 'force-dynamic';

export default async function SignupPage() {
  await redirectIfAuthenticated();
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/50 sm:p-9">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F5C451]">Get started</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Create your workspace</h2>
        <p className="mt-2 text-sm text-zinc-400">Set up your secure ReqGuard account in under a minute.</p>
      </div>
      <SignupForm />
    </div>
  );
}
