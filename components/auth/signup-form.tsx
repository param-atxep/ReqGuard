"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../../lib/validations';
import { z } from 'zod';
import PasswordStrength from './password-strength';
import OAuthButtons from './oauth-buttons';
import { motion } from 'framer-motion';

type SignupData = z.infer<typeof signupSchema>;

const inputClass = 'mt-2 w-full rounded-lg border border-zinc-800 bg-black px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#F5C451]';

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, watch, setError: setFieldError, formState: { errors } } =
    useForm<SignupData>({ resolver: zodResolver(signupSchema) });
  const password = watch('password') || '';
  const username = watch('username') || '';
  const email = watch('email') || '';

  useEffect(() => {
    let active = true;
    if (!username || username.length < 3) return;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/user/check?username=${encodeURIComponent(username)}`);
        if (active && (await response.json()).exists) setFieldError('username', { message: 'Username taken' });
      } catch { /* Availability checks should not block registration. */ }
    }, 500);
    return () => { active = false; clearTimeout(timer); };
  }, [username, setFieldError]);

  useEffect(() => {
    let active = true;
    if (!email || email.length < 4) return;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/user/check?email=${encodeURIComponent(email)}`);
        if (active && (await response.json()).exists) setFieldError('email', { message: 'Email already used' });
      } catch { /* Availability checks should not block registration. */ }
    }, 500);
    return () => { active = false; clearTimeout(timer); };
  }, [email, setFieldError]);

  async function onSubmit(values: SignupData) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (response.status === 201) {
        setSuccess(true);
        return;
      }
      const result = await response.json() as { error?: string };
      setError(result.error || 'Registration failed');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }

  if (success) return (
    <div className="py-8 text-center">
      <h3 className="text-lg font-semibold text-white">Check your email</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">A verification link was sent to your email. Please verify to continue.</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-xs font-medium text-zinc-300">Full name
          <input className={inputClass} {...register('fullName')} placeholder="Alex Morgan" />
          <span className="text-xs text-red-400">{errors.fullName?.message as string}</span>
        </label>
        <label className="text-xs font-medium text-zinc-300">Username
          <input className={inputClass} {...register('username')} placeholder="alexmorgan" />
          <span className="text-xs text-red-400">{errors.username?.message as string}</span>
        </label>
      </div>
      <label className="block text-xs font-medium text-zinc-300">Work email
        <input className={inputClass} {...register('email')} placeholder="you@company.com" />
        <span className="text-xs text-red-400">{errors.email?.message as string}</span>
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-xs font-medium text-zinc-300">Password
          <input type="password" className={inputClass} {...register('password')} placeholder="••••••••" />
          <span className="text-xs text-red-400">{errors.password?.message as string}</span>
        </label>
        <label className="text-xs font-medium text-zinc-300">Confirm password
          <input type="password" className={inputClass} {...register('confirmPassword')} placeholder="••••••••" />
          <span className="text-xs text-red-400">{errors.confirmPassword?.message as string}</span>
        </label>
      </div>
      <PasswordStrength password={password} />
      <label className="flex items-start gap-3 text-xs leading-5 text-zinc-400">
        <input type="checkbox" {...register('terms')} id="terms" className="mt-1 accent-[#F5C451]" />
        <span>I agree to the ReqGuard Terms of Service and Privacy Policy.</span>
      </label>
      <p className="text-xs text-red-400">{errors.terms?.message as string}</p>
      {error && <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">{error}</div>}
      <motion.button whileTap={{ scale: 0.98 }} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#F5C451] py-3.5 text-sm font-semibold text-black transition hover:bg-[#ffd66f] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
        {loading && <span className="auth-spinner h-4 w-4 rounded-full border-2 border-black/30 border-t-black" aria-hidden="true" />}
        {loading ? 'Creating account...' : 'Create account'}
      </motion.button>
      <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-zinc-600"><span className="h-px flex-1 bg-zinc-800" />or<span className="h-px flex-1 bg-zinc-800" /></div>
      <OAuthButtons />
      <p className="text-center text-sm text-zinc-500">Already have an account? <a href="/login" className="font-medium text-[#F5C451] hover:text-white">Sign in</a></p>
    </form>
  );
}
