"use client";
import React from 'react';
import ForgotForm from '../../../components/auth/forgot-form';

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-3xl mx-auto p-8">
      <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md rounded-[20px] p-8 border border-[#8A6A0A] shadow-[0_10px_30px_rgba(245,196,81,0.08)]">
        <h2 className="text-2xl font-semibold text-white mb-2">Forgot your password?</h2>
        <p className="text-zinc-400 mb-6">Enter your email and we'll send instructions to reset your password.</p>
        <ForgotForm />
      </div>
    </div>
  );
}
