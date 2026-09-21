import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dry Fish Shop - Cash Flow & Accounts Vault',
  description: 'Private, AES-256-GCM encrypted cash flow and shop accounts system for retail dry fish businesses.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-cyan-100 selection:text-cyan-900">
        {children}
      </body>
    </html>
  );
}
