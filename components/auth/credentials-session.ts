async function submitAuthForm(action: string, values: Record<string, string>) {
  const csrfResponse = await fetch('/api/auth/csrf');
  if (!csrfResponse.ok) throw new Error('Unable to initialize authentication');
  const { csrfToken } = await csrfResponse.json() as { csrfToken?: string };
  if (!csrfToken) throw new Error('Unable to initialize authentication');

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = action;
  form.hidden = true;
  for (const [name, value] of Object.entries({ csrfToken, ...values })) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export async function createCredentialsSession(identifier: string, password: string) {
  const params = new URLSearchParams(window.location.search);
  const callbackUrlFromQuery = params.get('callbackUrl') || '/dashboard';
  const callbackUrl = callbackUrlFromQuery.startsWith('/') ? callbackUrlFromQuery : '/dashboard';

  await submitAuthForm('/api/auth/callback/credentials', { identifier, password, callbackUrl });
}

export async function signOutCurrentSession() {
  await submitAuthForm('/api/auth/signout', { callbackUrl: '/login' });
}
