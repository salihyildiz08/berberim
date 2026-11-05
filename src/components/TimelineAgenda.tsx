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
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'pending'>('timeline');
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
  });

  // O güne ait randevular
  const dayAppointments = appointments.filter((a) => {
    if (a.appointmentDate !== currentDate || a.status === 'cancelled') return false;
    if (currentStaffId) return a.staffId === currentStaffId;
    if (selectedStaffFilter !== 'all') return a.staffId === selectedStaffFilter;
    return true;
  });

  const pendingAppointments = appointments.filter((a) => a.status === 'pending');

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
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
      {/* 1. ÜST KOYU GECE MAVİSİ BAŞLIK (REFERANS GÖRSEL 2 STANDARDI) */}
      <div className="bg-[#151b26] text-white px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold tracking-tight">Randevu Paneli</h1>
            <p className="text-xs text-slate-400 mt-0.5">{formattedDate}</p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => changeDay(-1)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
              title="Önceki Gün"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative">
              <input
                type="date"
                value={currentDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
              />
              <button
                type="button"
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition flex items-center gap-1 text-xs font-semibold"
              >
                <CalendarIcon className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            <button
              onClick={() => changeDay(1)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
              title="Sonraki Gün"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Patron ise: Usta Seçim Filtresi Hapları */}
        {isOwnerView && !currentStaffId && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedStaffFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition shrink-0 ${
                selectedStaffFilter === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              Tüm Ustalar
            </button>
            {staffList.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStaffFilter(st.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition shrink-0 ${
                  selectedStaffFilter === st.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'bg-white/10 text-slate-300 hover:bg-white/15'
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. İKİLİ TAB: AJANDA / BEKLEYENLER */}
      <div className="flex border-b border-slate-200 bg-slate-50/70">
        <button
          onClick={() => setActiveSubTab('timeline')}
          className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 border-b-2 ${
            activeSubTab === 'timeline'
              ? 'border-slate-900 text-slate-900 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="text-sm">≡</span>
          <span>Ajanda</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pending')}
          className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 border-b-2 ${
            activeSubTab === 'pending'
              ? 'border-slate-900 text-slate-900 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>🔔</span>
          <span>Bekleyenler ({pendingAppointments.length})</span>
        </button>
      </div>

      {/* 3. İÇERİK: DİKEY ZAMAN ÇİZGİSİ (REFERANS GÖRSEL 2 STANDARDI) */}
      {activeSubTab === 'timeline' ? (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="space-y-3 relative">
            {HOURS.map((hour) => {
              const matchingApts = dayAppointments.filter((a) => a.startTime === hour);

              return (
                <div key={hour} className="flex items-start gap-4 group">
                  {/* Sol Dikey Saat Cetveli */}
                  <div className="w-14 text-right pt-2 shrink-0">
                    <span className="text-xs font-bold text-slate-700 font-mono">{hour}</span>
                    <div className="w-[1px] h-10 bg-slate-200 mx-auto mt-1 group-last:hidden" />
                  </div>

                  {/* Sağ Randevu Kartı veya Boş Koltuk */}
                  <div className="flex-1 space-y-2">
                    {matchingApts.length > 0 ? (
                      matchingApts.map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => setSelectedApt(apt)}
                          className={`border rounded-2xl p-3.5 transition cursor-pointer shadow-xs flex items-center justify-between gap-3 ${
                            apt.status === 'in_chair'
                              ? 'bg-amber-500/10 border-amber-400 ring-1 ring-amber-400/40'
                              : apt.status === 'break'
                              ? 'bg-slate-100 border-slate-300 text-slate-600 border-dashed'
                              : apt.status === 'completed'
                              ? 'bg-white border-slate-200 hover:border-slate-300'
                              : 'bg-white border-blue-200 hover:border-blue-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              {apt.status === 'in_chair' && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                              )}
                              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">
                                {apt.customerName}
                              </h4>
                              {apt.visitCount && apt.visitCount > 1 && (
                                <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-bold flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> {apt.visitCount}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <span className="font-semibold text-slate-700">👤 {apt.staffName}</span>
                              <span>•</span>
                              <span>{apt.serviceName}</span>
                              {apt.price > 0 && <span className="text-slate-900 font-bold">({apt.price} TL)</span>}
                            </p>
                          </div>

                          <div className="shrink-0">
                            <span
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition ${
                                apt.status === 'in_chair'
                                  ? 'bg-amber-500 text-slate-950 font-black'
                                  : apt.status === 'completed'
                                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                  : apt.status === 'break'
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {apt.status === 'in_chair'
                                ? '✂️ Koltukta'
                                : apt.status === 'break'
                                ? 'Mola'
                                : apt.status === 'completed'
                                ? 'Tamamlandı'
                                : 'Onaylandı'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      /* Boş Saat Kutusu (Referans Görsel 2 Standartında) */
                      <div
                        onClick={() => {
                          setModalSlotTime(hour);
                          setModalType('appointment');
                        }}
                        className="border border-slate-200/90 rounded-2xl p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 text-center text-xs font-semibold cursor-pointer transition flex items-center justify-center gap-2 group/empty shadow-xs"
                      >
                        <span className="text-slate-400 group-hover/empty:text-slate-600">Boş</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md opacity-0 group-hover/empty:opacity-100 transition">
                          + Randevu veya Mola Ekle
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* BEKLEYENLER SEKMESİ */
        <div className="p-5 space-y-3">
          <div className="text-xs text-slate-500 font-semibold mb-2">
            Onay Bekleyen Online Rezervasyonlar ({pendingAppointments.length})
          </div>

          {pendingAppointments.length > 0 ? (
            pendingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{apt.customerName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {apt.appointmentDate} • {apt.startTime} - {apt.endTime} • {apt.serviceName}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">👤 Usta: {apt.staffName}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateStatus(apt.id, 'confirmed')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => onUpdateStatus(apt.id, 'cancelled')}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition"
                  >
                    Reddet
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Bekleyen herhangi bir randevu bulunmamaktadır.
            </div>
          )}
        </div>
      )}

      {/* HIZLI RANDEVU / MOLA MODALI */}
      {modalSlotTime && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {modalType === 'break' ? '☕ Koltuğu Molaya Kapat' : 'Hızlı Randevu Kaydı'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentDate} saat {modalSlotTime}
                </p>
              </div>
              <button onClick={() => setModalSlotTime(null)} className="text-slate-400 hover:text-slate-700 text-sm p-1">
                ✕
              </button>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setModalType('appointment')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  modalType === 'appointment' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" /> Müşteri Randevusu
              </button>
              <button
                type="button"
                onClick={() => setModalType('break')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  modalType === 'break' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" /> Mola / Kilit
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-3.5 text-xs">
              {modalType === 'appointment' ? (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Müşteri Ad Soyad *</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Yusuf Kalın"
                      value={quickCustomerName}
                      onChange={(e) => setQuickCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Telefon Numarası *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0532 000 00 00"
                      value={quickCustomerPhone}
                      onChange={(e) => setQuickCustomerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Hizmet *</label>
                      <select
                        value={quickServiceId}
                        onChange={(e) => setQuickServiceId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 text-xs"
                      >
                        {services.map((srv) => (
                          <option key={srv.id} value={srv.id}>
                            {srv.name} ({srv.durationMinutes} Dk)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Usta / Koltuk</label>
                      <select
                        value={modalStaffId}
                        onChange={(e) => setModalStaffId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 text-xs"
                      >
                        {staffList.map((st) => (
                          <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mola Sebebi</label>
                  <input
                    type="text"
                    placeholder="Örn: Yemek Molası / Dinlenme"
                    value={quickNotes}
                    onChange={(e) => setQuickNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 text-sm"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalSlotTime(null)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-xs"
                >
                  {modalType === 'break' ? 'Molayı Kilitle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEÇİLİ RANDEVU DETAY MODALI */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  Randevu Kartı
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1.5 uppercase">
                  {selectedApt.customerName}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedApt.customerPhone}</p>
              </div>
              <button onClick={() => setSelectedApt(null)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Hizmet:</span>
                <span className="font-bold text-slate-900">{selectedApt.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Koltuk / Usta:</span>
                <span className="font-bold text-slate-900">{selectedApt.staffName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Saat:</span>
                <span className="font-bold text-slate-900">{selectedApt.startTime} - {selectedApt.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tutar:</span>
                <span className="font-bold text-slate-900">{selectedApt.price > 0 ? `${selectedApt.price} TL` : 'Fiyatsız'}</span>
              </div>
            </div>

            {selectedApt.status !== 'break' && (
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-600">Durumu Değiştir:</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedApt.id, 'in_chair');
                      setSelectedApt(null);
                    }}
                    className={`py-2 px-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border ${
                      selectedApt.status === 'in_chair'
                        ? 'bg-amber-500 text-slate-950 border-amber-600'
                        : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200'
                    }`}
                  >
                    ✂️ Koltukta
                  </button>
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedApt.id, 'completed');
                      setSelectedApt(null);
                    }}
                    className="py-2 px-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Bitti
                  </button>
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedApt.id, 'cancelled');
                      setSelectedApt(null);
                    }}
                    className="py-2 px-1.5 rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600" /> İptal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
