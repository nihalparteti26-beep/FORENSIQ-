import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FORENSIQ · Brand Intelligence OS',
  description: 'An Intelligent Brand Governance OS that treats every claim like code - with version, evidence, expiry, and impact graph.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-sky-500 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
