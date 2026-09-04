import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM || 'no-reply@reqguard.example';
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] || character));

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendVerificationEmail(to: string, token: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const verifyUrl = `${base}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[ReqGuard] Resend paused locally. Verification URL: ${verifyUrl}`);
    return;
  }
  const html = `
  <div style="background:#050505;padding:40px;color:#fff;font-family:sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#0B0B0B;padding:32px;border-radius:12px;">
      <h2 style="color:#F5C451">Verify your email</h2>
      <p>Click the button below to verify your email for your ReqGuard workspace.</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;background:#F5C451;color:#050505;border-radius:8px;text-decoration:none;font-weight:700">Verify Email</a>
      <p style="color:#999;margin-top:12px">This link expires in 24 hours.</p>
    </div>
  </div>
  `;

  return getResend().emails.send({
    from: FROM,
    to,
    subject: 'Verify your ReqGuard email',
    html,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = `${base}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[ReqGuard] Resend paused locally. Password-reset URL: ${url}`);
    return;
  }

  const html = `
  <div style="background:#050505;padding:40px;color:#fff;font-family:sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#0B0B0B;padding:32px;border-radius:12px;">
      <h2 style="color:#F5C451">Reset your password</h2>
      <p>Click the button below to reset your ReqGuard password.</p>
      <a href="${url}" style="display:inline-block;padding:12px 20px;background:#F5C451;color:#050505;border-radius:8px;text-decoration:none;font-weight:700">Reset Password</a>
      <p style="color:#999;margin-top:12px">This link expires in 1 hour and is single-use.</p>
    </div>
  </div>
  `;

  return getResend().emails.send({
    from: FROM,
    to,
    subject: 'ReqGuard password reset',
    html,
  });
}

export async function sendWorkspaceInvitationEmail(to: string, token: string, workspaceName: string, role: string, message?: string | null) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const inviteUrl = `${base}/users?invite=${encodeURIComponent(token)}`;
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[ReqGuard] Resend paused locally. Workspace invitation URL: ${inviteUrl}`);
    return;
  }
  const html = `
  <div style="background:#050505;padding:40px;color:#fff;font-family:sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#0B0B0B;padding:32px;border-radius:12px;">
      <h2 style="color:#F5C451">You’re invited to ${escapeHtml(workspaceName)}</h2>
      <p>You’ve been invited to join as a <strong>${escapeHtml(role.toLowerCase())}</strong>.</p>
      ${message ? `<p style="color:#c9d1d9">${escapeHtml(message)}</p>` : ''}
      <a href="${inviteUrl}" style="display:inline-block;padding:12px 20px;background:#F5C451;color:#050505;border-radius:8px;text-decoration:none;font-weight:700">Review invitation</a>
      <p style="color:#999;margin-top:12px">This link expires in 7 days.</p>
    </div>
  </div>`;
  return getResend().emails.send({ from: FROM, to, subject: `Invitation to join ${workspaceName}`, html });
}
