import { auth } from './auth';
import { redirect } from 'next/navigation';

export async function getServerSession(req?: Request) {
  void req;
  return await auth();
}

export async function requireAuth(req?: Request) {
  const session = await getServerSession(req);
  if (!session) throw new Error('UNAUTHORIZED');
  return session;
}

export async function requirePageAuth() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  return session;
}

export async function redirectIfAuthenticated() {
  const session = await getServerSession();
  if (session) redirect('/dashboard');
}

export async function requireAdmin(req?: Request) {
  const session = await requireAuth(req);
  if (session?.user?.role !== 'ADMIN') throw new Error('FORBIDDEN');
  return session;
}
