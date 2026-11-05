'use client';

import React, { useState } from 'react';
import { AuthUser } from '@/types';
import { initialStaff } from '@/lib/dataStore';
import { Scissors, ShieldCheck, User, Lock, Mail, Phone, ArrowRight, UserCheck } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [authType, setAuthType] = useState<'admin_barber' | 'customer'>('admin_barber');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const handleAdminBarberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Süper Admin
    if (cleanEmail === 'yldzsalih27@gmail.com' && cleanPass === 'Yildiz.08') {
      onLoginSuccess({
        id: 'admin-1',
        name: 'Salih Yıldız (Süper Admin)',
        email: 'yldzsalih27@gmail.com',
        role: 'admin',
      });
      return;
    }

    // 2. Ana Berber / Salon Sahibi (Patron)
    if (cleanEmail === 'mehmet@salonkarizma.com' && (cleanPass === '123456' || cleanPass === 'Yildiz.08')) {
      onLoginSuccess({
        id: 'barber-owner-1',
        name: 'Mehmet Usta (Salon Sahibi)',
        email: 'mehmet@salonkarizma.com',
        role: 'barber_owner',
        salonId: 'salon-1',
      });
      return;
    }

    // 3. Personeller (Stilistler / Çalışan Ustalar)
    const matchingStaff = initialStaff.find((s) => s.email.toLowerCase() === cleanEmail);
    if (matchingStaff && (cleanPass === '123456' || cleanPass === 'Yildiz.08')) {
      onLoginSuccess({
        id: `user-${matchingStaff.id}`,
        name: matchingStaff.name,
        email: matchingStaff.email,
        role: 'barber_staff',
        salonId: 'salon-1',
        staffId: matchingStaff.id, // Kendi personeline kilitlendi!
      });
      return;
    }

    setErrorMsg('Hatalı e-posta veya şifre. Lütfen bilgilerinizi kontrol edin.');
  };

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      setErrorMsg('Lütfen adınızı ve cep telefonunuzu girin.');
      return;
    }

    onLoginSuccess({
      id: `cust-${Date.now()}`,
      name: customerName,
      phone: customerPhone,
      role: 'customer',
      salonId: 'salon-1',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* LOGO */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Scissors className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">BERBERİM SAAS</h1>
          <p className="text-xs text-slate-500">
            Salon & Koltuk Randevu Yönetim Sistemi
          </p>
        </div>

        {/* GİRİŞ TÜRÜ SEÇİMİ */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthType('admin_barber');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              authType === 'admin_barber'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Yönetici & Personel
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthType('customer');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              authType === 'customer'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" /> Müşteri Girişi
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {authType === 'admin_barber' ? (
          <form onSubmit={handleAdminBarberLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">E-Posta Adresi</label>
              <input
                type="email"
                required
                placeholder="ornek@salonkarizma.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Şifre</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition shadow-xs flex items-center justify-center gap-2"
            >
              <span>Hesaba Giriş Yap</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Test İçin Hızlı Hesap Seçimi */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase text-center">
                Tek Tıkla Giriş Rolünü Test Et:
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('yldzsalih27@gmail.com');
                    setPassword('Yildiz.08');
                    setErrorMsg('');
                  }}
                  className="py-1 px-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[10px] font-bold transition truncate"
                  title="Süper Admin (Salih Bey)"
                >
                  👑 Süper Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('mehmet@salonkarizma.com');
                    setPassword('123456');
                    setErrorMsg('');
                  }}
                  className="py-1 px-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-[10px] font-bold transition truncate"
                  title="Ana Berber / Salon Sahibi"
                >
                  ✂️ Salon Sahibi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('murat@salonkarizma.com');
                    setPassword('123456');
                    setErrorMsg('');
                  }}
                  className="py-1 px-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded text-[10px] font-bold transition truncate"
                  title="Personel (Murat Can) - Sadece kendi müşterilerini görür"
                >
                  👤 Personel (Murat)
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCustomerLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Adınız Soyadınız</label>
              <input
                type="text"
                required
                placeholder="Örn: Can Kaya"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Cep Telefonu</label>
              <input
                type="tel"
                required
                placeholder="0544 000 00 00"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition shadow-xs flex items-center justify-center gap-2"
            >
              <span>Randevu Almaya Başla</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setCustomerName('Can Kaya');
                  setCustomerPhone('0544 222 33 44');
                  setErrorMsg('');
                }}
                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
              >
                Örnek Müşteri Doldur (Can Kaya)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
