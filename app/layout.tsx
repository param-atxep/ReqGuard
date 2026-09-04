import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ReqGuard | AI-powered Requirement Engineering Platform',
  description:
    'ReqGuard analyzes software requirements to detect conflicts, inconsistencies, duplicates, ambiguities, and traceability issues before code is written.',
  icons: {
    icon: [{ url: '/req.ico', type: 'image/x-icon' }],
    shortcut: ['/req.ico'],
    apple: ['/req.ico'],
  },
  keywords: [
    'ReqGuard',
    'requirement engineering',
    'AI requirement analysis',
    'SRS validation',
    'software requirements',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
