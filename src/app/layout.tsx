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
      <body className="min-h-screen bg-[#F8F6F0] text-stone-900 antialiased selection:bg-[#B86B35]/20 selection:text-[#B86B35]">
        {children}
      </body>
    </html>
  );
}
