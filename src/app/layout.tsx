import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Berberim • Profesyonel Randevu & Salon Yönetimi',
  description: 'Berberler ve kuaförler için akıllı, sıfır maliyetli bulut randevu sistemi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-amber-100 selection:text-amber-900">
        {children}
      </body>
    </html>
  );
}
