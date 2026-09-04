"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetSchema } from '../../lib/validations';
import { z } from 'zod';

type ResetData = z.infer<typeof resetSchema>;

export default function ResetForm({ token, email }: { token?: string; email?: string }) {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetData>({ resolver: zodResolver(resetSchema) });

  async function onSubmit(values: ResetData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, email, password: values.password, confirmPassword: values.confirmPassword }) });
      if (res.ok) setOk(true);
      else {
        const d = await res.json();
        setError(d?.error || 'Reset failed');
      }
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally { setLoading(false); }
  }

  if (ok) return <div className="p-4 text-center text-zinc-400">Password reset successful — you can now <a href="/login" className="text-[#F5C451]">login</a>.</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="text-sm text-zinc-400">New password</label>
        <input type="password" className="mt-1 w-full p-3 rounded-lg bg-[#111] border border-transparent focus:border-[#8A6A0A] outline-none" {...register('password')} />
        <p className="text-xs text-red-400">{errors.password?.message as any}</p>
      </div>
      <div>
        <label className="text-sm text-zinc-400">Confirm password</label>
        <input type="password" className="mt-1 w-full p-3 rounded-lg bg-[#111] border border-transparent focus:border-[#8A6A0A] outline-none" {...register('confirmPassword')} />
        <p className="text-xs text-red-400">{errors.confirmPassword?.message as any}</p>
      </div>
      {error && <div className="text-sm text-red-400">{error}</div>}
      <button className="w-full py-3 rounded-lg bg-[#F5C451] text-black font-semibold" disabled={loading}>{loading ? 'Resetting...' : 'Reset password'}</button>
    </form>
  );
}
