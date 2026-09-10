import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Employee Platform — Digital Workforce Operating System',
  description: 'Enterprise B2B Digital Workforce OS managing 500 Canonical Role Packs across 44 Departments with Human Control, Security & Evaluation Gates.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="notranslate" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
