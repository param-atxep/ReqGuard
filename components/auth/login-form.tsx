"use client";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../lib/validations';
import { z } from 'zod';
import OAuthButtons from './oauth-buttons';
import { createCredentialsSession } from './credentials-session';
type LoginData = z.infer<typeof loginSchema>;
const inputClass = 'mt-2 w-full rounded-lg border border-zinc-800 bg-black px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#F5C451]';

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
  const errorCode = new URLSearchParams(window.location.search).get("error");

  if (errorCode === "CredentialsSignin")
    setError("Invalid email or password.");
}, []);

  async function onSubmit(values: LoginData) {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await createCredentialsSession(values.identifier, values.password);
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label className="text-xs font-medium text-zinc-300">Email or username</label>
        <input className={inputClass} {...register('identifier')} placeholder="you@company.com or username" />
        <p className="text-xs text-red-400">{errors.identifier?.message as any}</p>
      </div>

      <div>
        <label className="text-xs font-medium text-zinc-300">Password</label>
        <input type="password" className={inputClass} {...register('password')} placeholder="Enter your password" />
        <p className="text-xs text-red-400">{errors.password?.message as any}</p>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-zinc-400"><input type="checkbox" {...register('remember' as any)} className="accent-[#F5C451]" /> Remember me</label>
        <a href="/forgot-password" className="text-xs font-medium text-[#F5C451] hover:text-white">Forgot password?</a>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#F5C451] py-3.5 text-sm font-semibold text-black transition hover:bg-[#ffd66f] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
        {loading && <span className="auth-spinner h-4 w-4 rounded-full border-2 border-black/30 border-t-black" aria-hidden="true" />}
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-zinc-600"><span className="h-px flex-1 bg-zinc-800" />or continue with<span className="h-px flex-1 bg-zinc-800" /></div>
      <OAuthButtons />
      <p className="text-center text-sm text-zinc-500">New to ReqGuard? <a href="/signup" className="font-medium text-[#F5C451] hover:text-white">Create an account</a></p>
    </form>
  );
}
