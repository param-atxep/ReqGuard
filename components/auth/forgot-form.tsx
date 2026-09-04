"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotSchema } from '../../lib/validations';
import { z } from 'zod';

type ForgotData = z.infer<typeof forgotSchema>;

export default function ForgotForm() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotData>({ resolver: zodResolver(forgotSchema) });

  async function onSubmit(values: ForgotData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      if (res.ok) setOk(true);
      else setError('Error sending reset email');
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally { setLoading(false); }
  }

  if (ok) return <div className="p-4 text-center text-zinc-400">If the email exists, a password reset link has been sent.</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="text-sm text-zinc-400">Email</label>
        <input className="mt-1 w-full p-3 rounded-lg bg-[#111] border border-transparent focus:border-[#8A6A0A] outline-none" {...register('email')} />
        <p className="text-xs text-red-400">{errors.email?.message as any}</p>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}
      <button className="w-full py-3 rounded-lg bg-[#F5C451] text-black font-semibold" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>
    </form>
  );
}
