'use client';

import React, { useState } from 'react';
import { Staff, Appointment, Service } from '@/types';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  Scissors,
  Star,
} from 'lucide-react';

interface TimelineAgendaProps {
  currentDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
  staffList: Staff[];
  appointments: Appointment[];
  services: Service[];
  onAddQuickAppointment: (apt: Omit<Appointment, 'id' | 'createdAt'>) => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  currentStaffId?: string;
  isOwnerView: boolean;
}

const HOURS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
];

export const TimelineAgenda: React.FC<TimelineAgendaProps> = ({
  currentDate,
  onDateChange,
  staffList,
  appointments,
  services,
  onAddQuickAppointment,
  onUpdateStatus,
  currentStaffId,
  isOwnerView,
}) => {
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>(currentStaffId || 'all');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

  // Hızlı Randevu / Mola Modalı
  const [modalSlotTime, setModalSlotTime] = useState<string | null>(null);
  const [modalStaffId, setModalStaffId] = useState<string>(currentStaffId || staffList[0]?.id || '');
  const [modalType, setModalType] = useState<'appointment' | 'break'>('appointment');
  const [quickCustomerName, setQuickCustomerName] = useState('');
  const [quickCustomerPhone, setQuickCustomerPhone] = useState('');
  const [quickServiceId, setQuickServiceId] = useState(services[0]?.id || '');
  const [quickNotes, setQuickNotes] = useState('');

  const changeDay = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const formattedDate = new Date(currentDate).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });

  // O güne ait randevular
  const dayAppointments = appointments.filter((a) => {
    if (a.appointmentDate !== currentDate || a.status === 'cancelled') return false;
    if (currentStaffId) return a.staffId === currentStaffId;
    return true;
  });

  const activeStaffColumns = isOwnerView
    ? staffList
    : staffList.filter((s) => s.id === currentStaffId);

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalSlotTime) return;

    const staff = staffList.find((s) => s.id === modalStaffId) || staffList[0];

    if (modalType === 'break') {
      const [h, m] = modalSlotTime.split(':').map(Number);
      const totalMin = h * 60 + m + 45;
      const endH = String(Math.floor(totalMin / 60)).padStart(2, '0');
      const endM = String(totalMin % 60).padStart(2, '0');

      onAddQuickAppointment({
        salonId: 'salon-1',
        staffId: staff.id,
        staffName: staff.name,
        serviceId: 'break',
        serviceName: 'Mola / Koltuk Kilitli',
        customerName: '☕ Usta Molası',
        customerPhone: '-',
        appointmentDate: currentDate,
        startTime: modalSlotTime,
        endTime: `${endH}:${endM}`,
        price: 0,
        status: 'break',
        notes: quickNotes || 'Koltuk kilitlendi',
      });
    } else {
      if (!quickCustomerName || !quickCustomerPhone) return;

      const srv = services.find((s) => s.id === quickServiceId) || services[0];
      const [h, m] = modalSlotTime.split(':').map(Number);
      const totalMin = h * 60 + m + srv.durationMinutes;
      const endH = String(Math.floor(totalMin / 60)).padStart(2, '0');
      const endM = String(totalMin % 60).padStart(2, '0');

      onAddQuickAppointment({
        salonId: 'salon-1',
        staffId: staff.id,
        staffName: staff.name,
        serviceId: srv.id,
        serviceName: srv.name,
        customerName: quickCustomerName,
        customerPhone: quickCustomerPhone,
        appointmentDate: currentDate,
        startTime: modalSlotTime,
        endTime: `${endH}:${endM}`,
        price: srv.price,
        status: 'confirmed',
        visitCount: 1,
        notes: quickNotes,
      });
    }

    setModalSlotTime(null);
    setQuickCustomerName('');
    setQuickCustomerPhone('');
    setQuickNotes('');
  };

  return (
    <div className="bg-white border border-[#EBE7DF] rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* 1. ÜST KISIM: TARİH GEZGİNİ VE GÖSTERGE LEJANTI (SAYFA 2 BİREBİR) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EBE7DF]/70 pb-4">
        {/* Sol Tarih Gezgini: < 6 Kasım 2026, Cuma > */}
        <div className="flex items-center gap-2 bg-[#F8F6F0] px-3 py-1.5 rounded-2xl border border-[#EBE7DF]">
          <button
            onClick={() => changeDay(-1)}
            className="p-1 hover:bg-white rounded-lg transition text-stone-600 font-bold"
            title="Önceki Gün"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs sm:text-sm font-bold text-stone-900 px-2 min-w-[140px] text-center">
            {formattedDate}
          </span>

          <button
            onClick={() => changeDay(1)}
            className="p-1 hover:bg-white rounded-lg transition text-stone-600 font-bold"
            title="Sonraki Gün"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Sağ Durum Lejantı */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-stone-400 font-medium px-2 py-0.5">Boş</span>
          <span className="bg-[#E0F2FE] text-[#0369A1] font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
            Onaylandı
          </span>
          <span className="bg-[#FEF3C7] text-[#92400E] font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
            Koltukta
          </span>
          <span className="bg-[#E7F6EC] text-[#1B6E37] font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
            Tamamlandı
          </span>
        </div>
      </div>

      {/* 2. ÇOK KOLONLU AJANDA TABLOSU (SAYFA 2 BİREBİR) */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[650px] relative">
          {/* CANLI ZAMAN ÇİZGİSİ (10:40) */}
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
            style={{ top: '158px' }} // 10:40 civarı saat konumunda
          >
            <span className="bg-[#B86B35] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs ml-1 mr-1">
              10:40
            </span>
            <div className="flex-1 h-[2px] bg-[#B86B35] shadow-xs" />
          </div>

          {/* Kolon Başlıkları (Usta İsimleri) */}
          <div className="grid grid-cols-[80px_repeat(3,1fr)] gap-3 border-b border-[#EBE7DF]/80 pb-3 mb-3">
            <div className="text-xs text-stone-400 font-medium">Saat</div>
            {activeStaffColumns.slice(0, 3).map((staff) => (
              <div key={staff.id} className="text-center">
                <span className="font-bold text-sm text-stone-900">{staff.name}</span>
                <span className="block text-[11px] text-stone-400 mt-0.5">{staff.title}</span>
              </div>
            ))}
          </div>

          {/* Saat Satırları */}
          <div className="space-y-2.5">
            {HOURS.slice(0, 8).map((hour) => {
              return (
                <div key={hour} className="grid grid-cols-[80px_repeat(3,1fr)] gap-3 items-center">
                  {/* Sol Saat */}
                  <div className="text-xs font-mono font-medium text-stone-500 py-1">
                    {hour}
                  </div>

                  {/* 3 Usta Hücresi */}
                  {activeStaffColumns.slice(0, 3).map((staff) => {
                    const apt = dayAppointments.find(
                      (a) => a.staffId === staff.id && a.startTime === hour
                    );

                    if (apt) {
                      const isInChair = apt.status === 'in_chair';
                      const isCompleted = apt.status === 'completed';
                      const isConfirmed = apt.status === 'confirmed';

                      return (
                        <div
                          key={apt.id}
                          onClick={() => setSelectedApt(apt)}
                          className={`rounded-2xl p-3 border transition cursor-pointer shadow-xs ${
                            isInChair
                              ? 'bg-[#FEF3C7]/40 border-2 border-[#B86B35] ring-2 ring-[#B86B35]/20'
                              : 'bg-white border-[#EBE7DF] hover:border-stone-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-stone-900 truncate">
                              {apt.customerName}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                                isInChair
                                  ? 'bg-[#FEF3C7] text-[#92400E]'
                                  : isCompleted
                                  ? 'bg-[#E7F6EC] text-[#1B6E37]'
                                  : 'bg-[#E0F2FE] text-[#0369A1]'
                              }`}
                            >
                              {isInChair
                                ? 'Koltukta'
                                : isCompleted
                                ? 'Tamamlandı'
                                : 'Onaylandı'}
                            </span>
                          </div>

                          <div className="text-[11px] text-stone-500 mt-1 truncate">
                            {apt.serviceName} · ₺{apt.price}
                          </div>
                        </div>
                      );
                    }

                    // Boş Koltuk: "+ randevu yaz"
                    return (
                      <div
                        key={`${staff.id}-${hour}`}
                        onClick={() => {
                          setModalStaffId(staff.id);
                          setModalSlotTime(hour);
                          setModalType('appointment');
                        }}
                        className="bg-white border border-dashed border-[#EBE7DF] hover:border-stone-400 rounded-2xl py-3 px-3 text-center text-xs text-stone-400 hover:text-stone-700 cursor-pointer transition flex items-center justify-center gap-1 shadow-xs"
                      >
                        <span>+ randevu yaz</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RANDEVU DETAY & DURUM DEĞİŞTİRME MODALI */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE7DF] rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">{selectedApt.customerName}</h3>
                <p className="text-xs text-stone-500">
                  {selectedApt.appointmentDate} · {selectedApt.startTime} - {selectedApt.endTime}
                </p>
              </div>
              <button
                onClick={() => setSelectedApt(null)}
                className="text-stone-400 hover:text-stone-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Usta:</span>
                <span className="font-bold text-stone-900">{selectedApt.staffName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Hizmet:</span>
                <span className="font-bold text-stone-900">{selectedApt.serviceName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Tutar:</span>
                <span className="font-bold text-stone-900">₺{selectedApt.price}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">İletişim:</span>
                <span className="font-mono text-stone-700">{selectedApt.customerPhone}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-bold text-stone-500">Durumu Değiştir:</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus(selectedApt.id, 'in_chair');
                    setSelectedApt(null);
                  }}
                  className="py-2 rounded-xl text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-amber-300 hover:bg-amber-100 transition"
                >
                  Koltukta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus(selectedApt.id, 'completed');
                    setSelectedApt(null);
                  }}
                  className="py-2 rounded-xl text-xs font-bold bg-[#E7F6EC] text-[#1B6E37] border border-emerald-300 hover:bg-emerald-100 transition"
                >
                  Tamamlandı
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus(selectedApt.id, 'cancelled');
                    setSelectedApt(null);
                  }}
                  className="py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition"
                >
                  İptal Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HIZLI RANDEVU EKLEME MODALI */}
      {modalSlotTime && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE7DF] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">Yeni Randevu Yaz</h3>
                <p className="text-xs text-stone-500">
                  {currentDate} · Saat {modalSlotTime}
                </p>
              </div>
              <button
                onClick={() => setModalSlotTime(null)}
                className="text-stone-400 hover:text-stone-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Müşteri Adı Soyadı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Burak Kaya"
                  value={quickCustomerName}
                  onChange={(e) => setQuickCustomerName(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2 text-stone-900 focus:bg-white focus:outline-none focus:border-[#B86B35]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Telefon Numarası *</label>
                <input
                  type="tel"
                  required
                  placeholder="0532 123 45 67"
                  value={quickCustomerPhone}
                  onChange={(e) => setQuickCustomerPhone(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2 text-stone-900 focus:bg-white focus:outline-none focus:border-[#B86B35]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Hizmet Seçin *</label>
                <select
                  value={quickServiceId}
                  onChange={(e) => setQuickServiceId(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2 text-stone-900 focus:bg-white focus:outline-none focus:border-[#B86B35]"
                >
                  {services.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} ({srv.durationMinutes} dk - ₺{srv.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalSlotTime(null)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 font-semibold hover:bg-stone-200 transition"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#B86B35] hover:bg-[#A35C2B] text-white font-bold transition shadow-xs"
                >
                  Randevuyu Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};