"use client";
import React from 'react';
import ResetForm from '../../../components/auth/reset-form';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ResetPasswordContent() {
  const params = useSearchParams();
  const token = params?.get('token') || '';
  const email = params?.get('email') || '';

  return (
    <div className="w-full max-w-3xl mx-auto p-8">
      <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md rounded-[20px] p-8 border border-[#8A6A0A] shadow-[0_10px_30px_rgba(245,196,81,0.08)]">
        <h2 className="text-2xl font-semibold text-white mb-2">Reset password</h2>
        <p className="text-zinc-400 mb-6">Enter a new password for your account.</p>
        <ResetForm token={token} email={email} />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
