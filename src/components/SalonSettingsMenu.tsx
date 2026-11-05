'use client';

import React, { useState } from 'react';
import { Salon, Staff, CustomerProfile, AuthUser } from '@/types';
import {
  Users,
  Calendar,
  Wallet,
  TrendingUp,
  BookOpen,
  QrCode,
  LogOut,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Copy,
  Check,
  Download,
  Clock,
} from 'lucide-react';

interface SalonSettingsMenuProps {
  currentUser: AuthUser;
  salon: Salon;
  staffList: Staff[];
  customers: CustomerProfile[];
  onNavigateTab: (tab: 'agenda' | 'customers' | 'services' | 'staff' | 'finance' | 'qrcode' | 'settings' | 'hours') => void;
  onLogout: () => void;
}

export const SalonSettingsMenu: React.FC<SalonSettingsMenuProps> = ({
  currentUser,
  salon,
  staffList,
  customers,
  onNavigateTab,
  onLogout,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const isOwner = currentUser.role === 'barber_owner' || currentUser.role === 'admin';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://berberim.app/${salon.slug}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* 1. ÜST KOYU GECE MAVİSİ BAŞLIK (REFERANS GÖRSEL 1 STANDARDI) */}
      <div className="bg-[#151b26] text-white px-5 py-4 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold tracking-tight">Profil & Ayarlar</h1>
          <p className="text-xs text-slate-400 mt-0.5">{salon.name}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 text-amber-400 flex items-center justify-center font-bold text-xs">
          {currentUser.name.charAt(0)}
        </div>
      </div>

      {/* 2. AYARLAR GRUBU (iOS LIST GROUP - REFERANS GÖRSEL 1) */}
      <div className="space-y-1">
        <div className="text-[11px] font-bold text-slate-500 uppercase px-3 tracking-wider">
          Ayarlar
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {/* Personel Yönetimi (Sadece Patron) */}
          {isOwner && (
            <button
              onClick={() => onNavigateTab('staff')}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                    Personel Yönetimi
                  </h4>
                  <p className="text-[10px] text-slate-400">{staffList.length} aktif usta & koltuk</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {/* Personel Randevuları */}
          <button
            onClick={() => onNavigateTab('agenda')}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition">
                  Personel Randevuları
                </h4>
                <p className="text-[10px] text-slate-400">Günlük ajanda ve timeline akışı</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Finans / Gelir-Gider (Sadece Patron) */}
          {isOwner && (
            <button
              onClick={() => onNavigateTab('finance')}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition">
                    Finans / Gelir-Gider
                  </h4>
                  <p className="text-[10px] text-slate-400">Kasa, ciro ve tahsilat takibi</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {/* Personel Performansı */}
          {isOwner && (
            <button
              onClick={() => onNavigateTab('staff')}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    Personel Performansı & Prim
                  </h4>
                  <p className="text-[10px] text-slate-400">Usta bazlı kesim ve prim oranları</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {/* Müşterilerim */}
          <button
            onClick={() => onNavigateTab('customers')}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-600 transition">
                  Müşterilerim
                </h4>
                <p className="text-[10px] text-slate-400">{customers.length} kayıtlı müşteri ve kesim notları</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Karekodum */}
          <button
            onClick={() => onNavigateTab('qrcode')}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition">
                  Karekodum & Masa Standı
                </h4>
                <p className="text-[10px] text-slate-400">Dükkan QR kodu ve masa üstü bağlantısı</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Çıkış Yap */}
          <button
            onClick={onLogout}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-rose-50 transition text-rose-600 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold">Çıkış Yap</h4>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>

      {/* 3. ALTTTAKİ AYRI KUTULAR: Çalışma Saatleri & Randevu Ayarları */}
      {isOwner && (
        <div className="space-y-2">
          <button
            onClick={() => onNavigateTab('hours')}
            className="w-full bg-white p-4 rounded-2xl border border-slate-200/90 flex items-center justify-between text-left hover:bg-slate-50 transition shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition">
                  Çalışma Saatleri & Mola Düzeni
                </h4>
                <p className="text-[10px] text-slate-500">
                  Sabah 08:00 - Akşam 21:00, öğle molası & gün bazlı saatler
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => onNavigateTab('settings')}
            className="w-full bg-white p-4 rounded-2xl border border-slate-200/90 flex items-center justify-between text-left hover:bg-slate-50 transition shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                  Randevu Ayarları
                </h4>
                <p className="text-[10px] text-slate-500">
                  İleri tarihli randevu limiti, otomatik onay & süre dolunca tamamlama
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}
    </div>
  );
};
