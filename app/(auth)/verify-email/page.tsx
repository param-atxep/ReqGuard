"use client";
import React from 'react';
import VerifyCard from '../../../components/auth/verify-card';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params?.get('token') || '';
  const email = params?.get('email') || '';

  return (
    <div className="w-full max-w-3xl mx-auto p-8">
      <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md rounded-[20px] p-8 border border-[#8A6A0A] shadow-[0_10px_30px_rgba(245,196,81,0.08)]">
        <VerifyCard token={token} email={email} />
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
