import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
export const metadata: Metadata = { title: 'Bank Ledger | Kundan Yadav', description: 'A portfolio project by Kundan Yadav: an office ledger and CRM interface connected to a Go double-entry banking API.' };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body><Providers>{children}</Providers></body></html>; }
