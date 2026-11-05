'use client';

import React, { useState } from 'react';
import { Appointment, AuthUser } from '@/types';
import {
  Calendar as CalendarIcon,
  Clock,
  Scissors,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Repeat,
  Check,
  X,
} from 'lucide-react';

interface CustomerAppointmentsViewProps {
  currentUser: AuthUser;
  appointments: Appointment[];
  onCancelAppointment: (aptId: string) => void;
}

export const CustomerAppointmentsView: React.FC<CustomerAppointmentsViewProps> = ({
  currentUser,
  appointments,
  onCancelAppointment,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'cancelled'>('confirmed');
  const [confirmedArrivalId, setConfirmedArrivalId] = useState<string | null>(null);

  // Müşterinin kendi telefonuna veya adına ait randevular
  const userApts = appointments.filter(
    (a) =>
      a.customerName.toLowerCase() === currentUser.name.toLowerCase() ||
      (currentUser.phone && a.customerPhone.replace(/\s+/g, '') === currentUser.phone.replace(/\s+/g, ''))
  );

  const pendingList = userApts.filter((a) => a.status === 'pending');
  const confirmedList = userApts.filter((a) => a.status === 'confirmed' || a.status === 'completed' || a.status === 'in_chair');
  const cancelledList = userApts.filter((a) => a.status === 'cancelled');

  // En yakın aktif randevu (Sarı geri sayım kartı için)
  const nextAppointment = confirmedList.find((a) => a.status === 'confirmed');

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* 1. ÜST KOYU GECE MAVİSİ BAŞLIK (REFERANS GÖRSEL 3 STANDARDI) */}
      <div className="bg-[#151b26] text-white px-5 py-4 rounded-3xl shadow-sm text-center">
        <h1 className="text-base font-bold tracking-tight">Randevularım</h1>
        <p className="text-xs text-slate-400 mt-0.5">{currentUser.name}</p>
      </div>

      {/* 2. 3'LÜ SEKME: Bekleyen | Onaylanan | İptal / Red (REFERANS GÖRSEL 3 STANDARDI) */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1 shadow-xs">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2.5 text-xs font-bold transition text-center relative ${
            activeTab === 'pending' ? 'text-slate-900 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Bekleyen ({pendingList.length})
          {activeTab === 'pending' && (
            <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-amber-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('confirmed')}
          className={`flex-1 py-2.5 text-xs font-bold transition text-center relative ${
            activeTab === 'confirmed' ? 'text-slate-900 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Onaylanan ({confirmedList.length})
          {activeTab === 'confirmed' && (
            <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-amber-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('cancelled')}
          className={`flex-1 py-2.5 text-xs font-bold transition text-center relative ${
            activeTab === 'cancelled' ? 'text-slate-900 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          İptal / Red ({cancelledList.length})
          {activeTab === 'cancelled' && (
            <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-amber-500 rounded-full" />
          )}
        </button>
      </div>

      {/* 3. SARI GERİ SAYIM KARTI (REFERANS GÖRSEL 3'TEKİ HARDAL/SARI KART STANDARDI) */}
      {nextAppointment && activeTab === 'confirmed' && (
        <div className="bg-[#e5a93c] text-slate-950 p-4 rounded-2xl shadow-sm space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-950 shrink-0" />
            <h4 className="font-extrabold text-xs">
              Randevunuza 49 dakika kaldı. Geliyor musunuz?
            </h4>
          </div>

          <p className="text-[11px] font-medium text-slate-900/90 pl-7">
            Lütfen randevu saatinize riayet ediniz. Berberiniz koltuğu sizin için hazırladı.
          </p>

          <div className="pt-1 pl-7 flex gap-2">
            {confirmedArrivalId === nextAppointment.id ? (
              <span className="text-xs font-bold bg-white/90 text-slate-950 px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Geldiğinizi Belirttiniz, Teşekkürler!
              </span>
            ) : (
              <>
                <button
                  onClick={() => setConfirmedArrivalId(nextAppointment.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition"
                >
                  Evet, Geliyorum
                </button>
                <button
                  onClick={() => onCancelAppointment(nextAppointment.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-900 font-bold text-xs transition"
                >
                  Gelemiyorum (İptal)
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 4. RANDEVU BİLET KARTLARI (REFERANS GÖRSEL 3 STANDARDI) */}
      <div className="space-y-3">
        {activeTab === 'confirmed' &&
          (confirmedList.length > 0 ? (
            confirmedList.map((apt) => (
              <div
                key={apt.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-xs"
              >
                {/* Üst Satır: Tarih ve Saat */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span>{apt.appointmentDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{apt.startTime}</span>
                  </div>
                </div>

                {/* Alt Satır: Berber ve Rozet */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Berber: <span className="uppercase">{apt.staffName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{apt.serviceName}</div>
                    {apt.recurringDays && (
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold border border-amber-200 inline-flex items-center gap-1 mt-1">
                        <Repeat className="w-3 h-3 text-amber-600" /> Her {apt.recurringDays} günde 1 tekrar
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      apt.status === 'in_chair'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : apt.status === 'completed'
                        ? 'bg-slate-100 text-slate-600 border border-slate-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {apt.status === 'in_chair'
                      ? 'Koltukta'
                      : apt.status === 'completed'
                      ? 'Tamamlandı'
                      : 'Onaylandı'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200">
              Onaylanmış aktif bir randevunuz bulunmamaktadır.
            </div>
          ))}

        {activeTab === 'pending' &&
          (pendingList.length > 0 ? (
            pendingList.map((apt) => (
              <div
                key={apt.id}
                className="bg-white border border-amber-200 rounded-2xl p-4 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span>{apt.appointmentDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{apt.startTime}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Berber: <span className="uppercase">{apt.staffName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{apt.serviceName}</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Onay Bekliyor
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200">
              Onay bekleyen randevunuz bulunmamaktadır.
            </div>
          ))}

        {activeTab === 'cancelled' &&
          (cancelledList.length > 0 ? (
            cancelledList.map((apt) => (
              <div
                key={apt.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs opacity-75"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 border-b border-slate-100 pb-2.5">
                  <span>{apt.appointmentDate}</span>
                  <span>{apt.startTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-700">Berber: {apt.staffName}</div>
                    <div className="text-[11px] text-slate-400">{apt.serviceName}</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    İptal Edildi
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200">
              İptal edilmiş bir randevunuz bulunmamaktadır.
            </div>
          ))}
      </div>
    </div>
  );
};
