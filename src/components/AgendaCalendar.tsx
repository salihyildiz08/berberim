'use client';

import React, { useState } from 'react';
import { Staff, Appointment, Service } from '@/types';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Coffee,
  Sparkles,
  Scissors,
  Star,
  Eye,
  Filter,
} from 'lucide-react';

interface AgendaCalendarProps {
  currentDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
  staffList: Staff[];
  appointments: Appointment[];
  services: Service[];
  onAddQuickAppointment: (apt: Omit<Appointment, 'id' | 'createdAt'>) => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  // Personel kısıtlaması (Personel girerse sadece kendi koltuğunu görür!)
  currentStaffId?: string; // Tanımlıysa bu personel giriş yapmıştır
  isOwnerView: boolean;    // Ana berber (patron) mi bakıyor?
}

const HOURS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
];

export const AgendaCalendar: React.FC<AgendaCalendarProps> = ({
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
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

  // Patron için usta filtresi ('all' veya spesifik personel id)
  const [ownerFilterStaffId, setOwnerFilterStaffId] = useState<string>('all');

  // Hızlı Randevu / Mola Modalı
  const [modalSlot, setModalSlot] = useState<{ staffId: string; time: string } | null>(null);
  const [modalType, setModalType] = useState<'appointment' | 'break'>('appointment');
  const [quickCustomerName, setQuickCustomerName] = useState('');
  const [quickCustomerPhone, setQuickCustomerPhone] = useState('');
  const [quickServiceId, setQuickServiceId] = useState(services[0]?.id || '');
  const [quickNotes, setQuickNotes] = useState('');

  // Hangi personellerin koltuğu gösterilecek?
  // Personel ise YALNIZCA KENDİSİ!
  // Patron ise filtreye göre ya hepsi ya da seçtiği usta
  const visibleStaff = currentStaffId
    ? staffList.filter((s) => s.id === currentStaffId)
    : ownerFilterStaffId === 'all'
    ? staffList
    : staffList.filter((s) => s.id === ownerFilterStaffId);

  const changeDay = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const formattedDateHeader = new Date(currentDate).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Görüntülenen personellerin randevuları
  const dayAppointments = appointments.filter((a) => {
    if (a.appointmentDate !== currentDate) return false;
    if (currentStaffId) return a.staffId === currentStaffId;
    if (ownerFilterStaffId !== 'all') return a.staffId === ownerFilterStaffId;
    return true;
  });

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalSlot) return;

    const staff = staffList.find((st) => st.id === modalSlot.staffId);

    if (modalType === 'break') {
      // Mola / Koltuk Kilitleme
      const [h, m] = modalSlot.time.split(':').map(Number);
      const totalMin = h * 60 + m + 45; // 45 dk mola
      const endH = String(Math.floor(totalMin / 60)).padStart(2, '0');
      const endM = String(totalMin % 60).padStart(2, '0');

      onAddQuickAppointment({
        salonId: 'salon-1',
        staffId: modalSlot.staffId,
        staffName: staff?.name || 'Stilist',
        serviceId: services[0]?.id || 'break',
        serviceName: 'Mola / Koltuk Kilitli',
        customerName: '☕ Usta Molası',
        customerPhone: '-',
        appointmentDate: currentDate,
        startTime: modalSlot.time,
        endTime: `${endH}:${endM}`,
        price: 0,
        status: 'break',
        notes: quickNotes || 'Dinlenme / Yemek molası',
      });
    } else {
      // Müşteri Randevusu
      if (!quickCustomerName || !quickCustomerPhone) return;

      const srv = services.find((s) => s.id === quickServiceId) || services[0];
      const [h, m] = modalSlot.time.split(':').map(Number);
      const totalMin = h * 60 + m + srv.durationMinutes;
      const endH = String(Math.floor(totalMin / 60)).padStart(2, '0');
      const endM = String(totalMin % 60).padStart(2, '0');

      onAddQuickAppointment({
        salonId: 'salon-1',
        staffId: modalSlot.staffId,
        staffName: staff?.name || 'Stilist',
        serviceId: srv.id,
        serviceName: srv.name,
        customerName: quickCustomerName,
        customerPhone: quickCustomerPhone,
        appointmentDate: currentDate,
        startTime: modalSlot.time,
        endTime: `${endH}:${endM}`,
        price: srv.price,
        status: 'confirmed',
        visitCount: 1,
        notes: quickNotes,
      });
    }

    setModalSlot(null);
    setQuickCustomerName('');
    setQuickCustomerPhone('');
    setQuickNotes('');
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs flex flex-col">
      {/* ÜST KONTROL VE FİLTRE ÇUBUĞU */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
            <button
              onClick={() => changeDay(-1)}
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition"
              title="Önceki Gün"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
              className="px-3 py-1 text-xs font-bold text-slate-800 hover:text-slate-950 transition"
            >
              Bugün
            </button>
            <button
              onClick={() => changeDay(1)}
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition"
              title="Sonraki Gün"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900 capitalize">
                {formattedDateHeader}
              </h2>
              {currentStaffId ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  🔒 Kendi Koltuğunuz (Personel Modu)
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  👑 Salon Yöneticisi Görünümü (Tüm Koltuklar)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {dayAppointments.filter((a) => a.status !== 'break').length} müşteri randevusu • {dayAppointments.filter((a) => a.status === 'in_chair').length} şu an koltukta
            </p>
          </div>
        </div>

        {/* Patron ise: Usta Seçim Filtresi */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {isOwnerView && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={ownerFilterStaffId}
                onChange={(e) => setOwnerFilterStaffId(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="all">Tüm Personeller (Salon Matrisi)</option>
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} Koltuğu
                  </option>
                ))}
              </select>
            </div>
          )}

          <input
            type="date"
            value={currentDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-white border border-slate-200 text-xs text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-slate-400 shadow-xs"
          />
        </div>
      </div>

      {/* SÜTUNLU AJANDA TABLOSU (BERBER KOLTUK IZGARASI) */}
      <div className="overflow-x-auto flex-1">
        <div className={visibleStaff.length === 1 ? 'min-w-full' : 'min-w-[780px]'}>
          {/* Koltuk Başlıkları */}
          <div
            className={`grid border-b border-slate-200 bg-slate-100/90 sticky top-0 z-10 ${
              visibleStaff.length === 1
                ? 'grid-cols-[70px_1fr]'
                : `grid-cols-[70px_repeat(${visibleStaff.length},1fr)]`
            }`}
          >
            <div className="p-3 text-center text-[11px] font-bold text-slate-400 border-r border-slate-200 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>

            {visibleStaff.map((st) => {
              const staffApts = dayAppointments.filter((a) => a.staffId === st.id && a.status !== 'cancelled' && a.status !== 'break');
              const staffRevenue = staffApts.reduce((sum, a) => sum + (a.price || 0), 0);
              const staffCommission = (staffRevenue * (st.commissionRate || 40)) / 100;

              return (
                <div
                  key={st.id}
                  className="p-3 border-r border-slate-200 last:border-r-0 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {st.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">{st.name}</h3>
                      <p className="text-[10px] text-slate-500">{st.title}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200 shadow-xs">
                      {staffApts.length} Müşteri
                    </span>
                    {/* Personel ise kendi primini, Patron ise ciro ve primi görür */}
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {isOwnerView ? `Ciro: ${staffRevenue} TL` : `Hak Edilen Prim: ${staffCommission} TL`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Saat Izgarası */}
          <div className="divide-y divide-slate-100">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className={`grid min-h-[56px] group transition ${
                  visibleStaff.length === 1
                    ? 'grid-cols-[70px_1fr]'
                    : `grid-cols-[70px_repeat(${visibleStaff.length},1fr)]`
                }`}
              >
                {/* Saat Dilimi */}
                <div className="p-2 text-center text-xs font-mono font-medium text-slate-400 border-r border-slate-200 bg-slate-50/50 flex items-start justify-center">
                  {hour}
                </div>

                {/* Koltuk Kolonları */}
                {visibleStaff.map((st) => {
                  const apt = dayAppointments.find(
                    (a) => a.staffId === st.id && a.startTime === hour && a.status !== 'cancelled'
                  );

                  return (
                    <div
                      key={st.id}
                      className="border-r border-slate-200 last:border-r-0 p-1 relative hover:bg-slate-50/80 transition group/cell"
                    >
                      {apt ? (
                        <div
                          onClick={() => setSelectedApt(apt)}
                          className={`h-full w-full rounded-xl p-2.5 cursor-pointer transition-all shadow-xs flex flex-col justify-between border ${
                            apt.status === 'in_chair'
                              ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold ring-2 ring-amber-400/40 shadow-sm'
                              : apt.status === 'break'
                              ? 'bg-slate-100 border-slate-300 text-slate-600 border-dashed'
                              : apt.status === 'completed'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-950 hover:bg-emerald-100/70'
                              : 'bg-blue-50/80 border-blue-200 text-slate-900 hover:bg-blue-100/70'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 truncate">
                              {apt.status === 'in_chair' && (
                                <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
                              )}
                              {apt.status === 'break' && <Coffee className="w-3.5 h-3.5 text-slate-500" />}
                              <span className="text-xs font-bold truncate">{apt.customerName}</span>
                            </div>
                            <span className="text-[10px] font-mono opacity-80 shrink-0">
                              {apt.startTime} - {apt.endTime}
                            </span>
                          </div>

                          <div className="text-[11px] truncate opacity-90 mt-0.5">
                            {apt.serviceName}
                          </div>

                          <div className="flex items-center justify-between mt-1 text-[10px]">
                            <span className="font-bold">
                              {apt.status === 'break' ? 'Koltuk Kilitli' : apt.price > 0 ? `${apt.price} TL` : 'Fiyatsız'}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                                apt.status === 'in_chair'
                                  ? 'bg-slate-950 text-amber-300'
                                  : apt.status === 'break'
                                  ? 'bg-slate-200 text-slate-700'
                                  : apt.status === 'completed'
                                  ? 'bg-emerald-200 text-emerald-900'
                                  : 'bg-blue-200 text-blue-900'
                              }`}
                            >
                              {apt.status === 'in_chair'
                                ? '✂️ Koltukta'
                                : apt.status === 'break'
                                ? 'Mola'
                                : apt.status === 'completed'
                                ? 'Tamamlandı'
                                : 'Onaylı'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full opacity-0 group-hover/cell:opacity-100 flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setModalSlot({ staffId: st.id, time: hour });
                              setModalType('appointment');
                            }}
                            className="px-2 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 transition text-[11px] font-bold flex items-center gap-1 shadow-xs"
                            title="Müşteri Randevusu Ekle"
                          >
                            <Plus className="w-3 h-3" /> Randevu
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setModalSlot({ staffId: st.id, time: hour });
                              setModalType('break');
                            }}
                            className="px-2 py-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 transition text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                            title="Bu Saati Molaya Kapat"
                          >
                            <Coffee className="w-3 h-3" /> Mola
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HIZLI RANDEVU VEYA MOLA EKLEME MODALI */}
      {modalSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {modalType === 'break' ? '☕ Koltuğu Molaya Kapat' : 'Hızlı Randevu Kaydı'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {staffList.find((s) => s.id === modalSlot.staffId)?.name} • {currentDate} saat {modalSlot.time}
                </p>
              </div>
              <button
                onClick={() => setModalSlot(null)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* Tür Seçimi: Randevu mu Mola mı? */}
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
                      placeholder="Örn: Serkan Yılmaz"
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

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Hizmet Seçimi *</label>
                    <select
                      value={quickServiceId}
                      onChange={(e) => setQuickServiceId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 text-xs"
                    >
                      {services.map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} ({srv.durationMinutes} Dk {srv.price > 0 ? `• ${srv.price} TL` : ''})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mola Açıklaması</label>
                  <input
                    type="text"
                    placeholder="Örn: Öğle Yemeği / Namaz Molası (45 Dk)"
                    value={quickNotes}
                    onChange={(e) => setQuickNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 text-sm"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Bu süre boyunca müşteriler bu koltuğa online randevu alamaz.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalSlot(null)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-xs"
                >
                  {modalType === 'break' ? 'Molayı Başlat' : 'Randevuyu Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SEÇİLİ RANDEVU / MÜŞTERİ KARTI MODALI */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    Müşteri Kartı
                  </span>
                  {selectedApt.visitCount && selectedApt.visitCount > 1 && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {selectedApt.visitCount}. Gelişi
                    </span>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-1.5">
                  {selectedApt.customerName}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {selectedApt.customerPhone}
                </p>
              </div>
              <button
                onClick={() => setSelectedApt(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
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
                <span className="text-slate-500">Saat Dilimi:</span>
                <span className="font-bold text-slate-900">
                  {selectedApt.appointmentDate} • {selectedApt.startTime} - {selectedApt.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hizmet Bedeli:</span>
                <span className="font-bold text-slate-900">
                  {selectedApt.price > 0 ? `${selectedApt.price} TL` : 'Fiyatsız'}
                </span>
              </div>
              {selectedApt.notes && (
                <div className="pt-2 border-t border-slate-200 text-slate-700 italic">
                  Not: "{selectedApt.notes}"
                </div>
              )}
            </div>

            {selectedApt.status !== 'break' && (
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-600">Koltuk Durumu Güncelle:</div>
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
