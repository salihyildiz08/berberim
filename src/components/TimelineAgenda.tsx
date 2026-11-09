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
  AlertCircle,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  Scissors,
  Star,
  MessageCircle,
  Smartphone,
  LayoutGrid,
  List,
  Sparkles,
  UserCheck,
  XCircle,
  DollarSign,
  Armchair,
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
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00'
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
  // Görünüm modu: 'feed' (Mobil/Dokunmatik Kart Akışı) veya 'matrix' (Çok Sütunlu Koltuk Matrisi)
  const [viewMode, setViewMode] = useState<'feed' | 'matrix'>('feed');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_action' | 'completed' | 'no_show'>('all');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>(currentStaffId || 'all');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

  // Erken tamamlama onay modalı (Zamanı gelmeyen randevunun kilit kontrolü)
  const [earlyCompleteTarget, setEarlyCompleteTarget] = useState<Appointment | null>(null);

  // Hızlı Randevu / Mola Modalı
  const [modalSlotTime, setModalSlotTime] = useState<string | null>(null);
  const [modalStaffId, setModalStaffId] = useState<string>(currentStaffId || staffList[0]?.id || '');
  const [modalType, setModalType] = useState<'appointment' | 'break'>('appointment');
  const [quickCustomerName, setQuickCustomerName] = useState('');
  const [quickCustomerPhone, setQuickCustomerPhone] = useState('');
  const [quickServiceId, setQuickServiceId] = useState(services[0]?.id || '');
  const [quickNotes, setQuickNotes] = useState('');
  const [quickTags, setQuickTags] = useState<string[]>([]);

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

  // O güne ait randevular (İptaller hariç)
  const dayAppointments = appointments
    .filter((a) => {
      if (a.appointmentDate !== currentDate) return false;
      if (selectedStaffFilter !== 'all' && a.staffId !== selectedStaffFilter) return false;
      if (currentStaffId && a.staffId !== currentStaffId) return false;
      return true;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Filtrelenmiş liste
  const filteredAppointments = dayAppointments.filter((a) => {
    if (a.status === 'cancelled') return false;
    if (statusFilter === 'pending') return a.status === 'pending' || a.status === 'confirmed';
    if (statusFilter === 'in_action') return a.status === 'in_chair';
    if (statusFilter === 'completed') return a.status === 'completed';
    if (statusFilter === 'no_show') return a.status === 'no_show';
    return true;
  });

  // İstatistik Sayaçları
  const pendingCount = dayAppointments.filter((a) => a.status === 'pending' || a.status === 'confirmed').length;
  const inChairCount = dayAppointments.filter((a) => a.status === 'in_chair').length;
  const completedCount = dayAppointments.filter((a) => a.status === 'completed').length;
  const noShowCount = dayAppointments.filter((a) => a.status === 'no_show').length;
  const totalRevenue = dayAppointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + (a.price || 0), 0);

  const activeStaffColumns = isOwnerView
    ? (selectedStaffFilter === 'all' ? staffList : staffList.filter((s) => s.id === selectedStaffFilter))
    : staffList.filter((s) => s.id === currentStaffId);

  // Akıllı Tamamlama Kontrolü
  const handleRequestComplete = (apt: Appointment) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const currentTotalMin = currentH * 60 + currentM;

    const [aptEndH, aptEndM] = apt.endTime.split(':').map(Number);
    const aptEndTotalMin = aptEndH * 60 + aptEndM;

    // Eğer randevu bugünün ve henüz bitiş saati gelmediyse veya gelecekteki bir günse
    if (apt.appointmentDate > todayStr || (apt.appointmentDate === todayStr && currentTotalMin < aptEndTotalMin)) {
      setEarlyCompleteTarget(apt);
    } else {
      onUpdateStatus(apt.id, 'completed');
    }
  };

  // WhatsApp Hızlı Mesaj Linki
  const openWhatsApp = (phone: string, customerName: string, time: string, serviceName?: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('90') ? cleanPhone : `90${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`;
    const text = encodeURIComponent(
      `Merhaba ${customerName}, Berberim randevunuzu hatırlatmak isteriz: Bugün saat ${time}'da ${serviceName ? `"${serviceName}" için ` : ''}sizi bekliyoruz.`
    );
    window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank');
  };

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
        structuredTags: quickTags,
      });
    }

    setModalSlotTime(null);
    setQuickCustomerName('');
    setQuickCustomerPhone('');
    setQuickNotes('');
    setQuickTags([]);
  };

  return (
    <div className="bg-[#151D2A] border border-[#2B384E] rounded-3xl p-4 sm:p-6 text-white shadow-xl space-y-6">
      {/* 1. ÜST BAŞLIK & METRİK BARI */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#2B384E] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Scissors className="w-6 h-6 text-[#D97706]" />
              Günlük Ajanda & Koltuk Operasyonu
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tek dokunuşla randevu durumu yönetimi, berber tercih etiketleri ve kilitli süre kontrolü.
          </p>
        </div>

        {/* Canlı Kasa ve Durum Sayaçları */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
          <div className="bg-[#1E293B] border border-[#334155] px-3 py-2 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Koltukta</span>
            <span className="text-base font-extrabold text-amber-400 flex items-center justify-center gap-1">
              <Scissors className="w-3.5 h-3.5" /> {inChairCount}
            </span>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] px-3 py-2 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Bekleyen</span>
            <span className="text-base font-extrabold text-blue-400 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {pendingCount}
            </span>
          </div>

          <div className="bg-[#1E293B] border border-[#334155] px-3 py-2 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Tamamlanan</span>
            <span className="text-base font-extrabold text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {completedCount}
            </span>
          </div>

          <div className="bg-[#1E293B] border border-[#D97706]/40 px-3 py-2 rounded-2xl text-center">
            <span className="text-[10px] text-[#FDE68A] uppercase tracking-wider block font-bold">Bugünkü Kasa</span>
            <span className="text-base font-black text-[#FDE68A]">
              ₺{totalRevenue.toLocaleString('tr-TR')}
            </span>
          </div>
        </div>
      </div>

      {/* 2. KONTROL ARAÇLARI: TARİH GEZGİNİ, FİLTRELER VE GÖRÜNÜM GEÇİŞİ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Sol: Tarih Gezgini */}
        <div className="flex items-center gap-2 bg-[#1E293B] px-3 py-1.5 rounded-2xl border border-[#334155]">
          <button
            onClick={() => changeDay(-1)}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-[#334155] rounded-xl transition text-slate-300 font-bold active:scale-95"
            title="Önceki Gün"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-xs sm:text-sm font-bold text-white px-2 min-w-[150px] text-center">
            {formattedDate}
          </span>

          <button
            onClick={() => changeDay(1)}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-[#334155] rounded-xl transition text-slate-300 font-bold active:scale-95"
            title="Sonraki Gün"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Orta: Usta Seçimi (Varsa) */}
        {isOwnerView && staffList.length > 1 && (
          <div className="flex items-center gap-2">
            <select
              value={selectedStaffFilter}
              onChange={(e) => setSelectedStaffFilter(e.target.value)}
              className="bg-[#1E293B] border border-[#334155] text-xs font-bold text-slate-200 rounded-2xl px-3 py-2 min-h-[44px] focus:outline-none focus:border-[#D97706]"
            >
              <option value="all">Tüm Ustalar ({staffList.length})</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.title})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sağ: Görünüm Modu Değiştirici */}
        <div className="flex items-center gap-1 bg-[#1E293B] p-1 rounded-2xl border border-[#334155]">
          <button
            onClick={() => setViewMode('feed')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 min-h-[44px] ${
              viewMode === 'feed'
                ? 'bg-[#D97706] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Kart Akışı</span>
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 min-h-[44px] ${
              viewMode === 'matrix'
                ? 'bg-[#D97706] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Koltuk Matrisi</span>
          </button>
        </div>
      </div>

      {/* 3. DURUM FİLTRE BUTONLARI (TEK DOKUNUŞ) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap min-h-[44px] transition ${
            statusFilter === 'all'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'bg-[#1E293B] text-slate-400 hover:text-white'
          }`}
        >
          Tümü ({dayAppointments.filter((a) => a.status !== 'cancelled').length})
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap min-h-[44px] transition flex items-center gap-1.5 ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-slate-900 font-extrabold shadow-sm'
              : 'bg-[#1E293B] text-amber-300 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Bekleyen ({pendingCount})
        </button>

        <button
          onClick={() => setStatusFilter('in_action')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap min-h-[44px] transition flex items-center gap-1.5 ${
            statusFilter === 'in_action'
              ? 'bg-purple-600 text-white font-extrabold shadow-sm'
              : 'bg-[#1E293B] text-purple-300 hover:text-white'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          Koltukta ({inChairCount})
        </button>

        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap min-h-[44px] transition flex items-center gap-1.5 ${
            statusFilter === 'completed'
              ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
              : 'bg-[#1E293B] text-emerald-300 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Tamamlandı ({completedCount})
        </button>

        <button
          onClick={() => setStatusFilter('no_show')}
          className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap min-h-[44px] transition flex items-center gap-1.5 ${
            statusFilter === 'no_show'
              ? 'bg-rose-600 text-white font-extrabold shadow-sm'
              : 'bg-[#1E293B] text-rose-300 hover:text-white'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Gelmedi / No-Show ({noShowCount})
        </button>

        <button
          onClick={() => {
            setModalSlotTime('12:00');
            setModalType('appointment');
          }}
          className="ml-auto px-4 py-2 rounded-xl font-extrabold bg-[#D97706] hover:bg-[#B45309] text-white flex items-center gap-1.5 min-h-[44px] shrink-0 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          + Hızlı Randevu Yaz
        </button>
      </div>

      {/* 4. A) GÖRÜNÜM: MOBİL & TABLET İÇİN AKILLI KART AKIŞI (FEED) */}
      {viewMode === 'feed' && (
        <div className="space-y-3">
          {filteredAppointments.length === 0 ? (
            <div className="bg-[#1E293B]/60 border border-dashed border-[#334155] rounded-3xl p-10 text-center space-y-3">
              <Armchair className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">Bu filtrede randevu bulunmuyor</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {formattedDate} tarihi için seçili kriterde kayıtlı işlem yok. Yeni bir randevu yazabilir veya başka bir güne geçebilirsiniz.
              </p>
              <button
                onClick={() => {
                  setModalSlotTime('14:00');
                  setModalType('appointment');
                }}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs"
              >
                + Yeni Randevu Oluştur
              </button>
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const isInChair = apt.status === 'in_chair';
              const isCompleted = apt.status === 'completed';
              const isNoShow = apt.status === 'no_show';
              const isConfirmed = apt.status === 'confirmed';
              const isPending = apt.status === 'pending';
              const isBreak = apt.status === 'break';

              return (
                <div
                  key={apt.id}
                  className={`border rounded-2xl p-4 sm:p-5 transition space-y-3.5 ${
                    isInChair
                      ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30 shadow-lg'
                      : isCompleted
                      ? 'bg-[#151D2A] border-emerald-900/60 opacity-80'
                      : isNoShow
                      ? 'bg-rose-950/30 border-rose-800/60'
                      : 'bg-[#1E293B] border-[#334155] hover:border-slate-400'
                  }`}
                >
                  {/* Kart Üst Barı: Saat, Usta ve Durum Rozeti */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 font-mono text-xs sm:text-sm font-black text-amber-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {apt.startTime} - {apt.endTime}
                      </div>

                      <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {apt.staffName || 'Usta'}
                      </span>
                    </div>

                    {/* Çift Gösterimli Durum Rozeti (İkon + Metin + Renk) */}
                    <div>
                      {isInChair && (
                        <span className="bg-purple-900/80 text-purple-200 border border-purple-500 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                          <Scissors className="w-3.5 h-3.5" />
                          KOLTUKTA (İŞLEMDE)
                        </span>
                      )}
                      {isCompleted && (
                        <span className="bg-emerald-900/80 text-emerald-200 border border-emerald-500 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          TAMAMLANDI
                        </span>
                      )}
                      {isNoShow && (
                        <span className="bg-rose-900/80 text-rose-200 border border-rose-500 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          GELMEDİ (NO-SHOW)
                        </span>
                      )}
                      {(isConfirmed || isPending) && !isBreak && (
                        <span className="bg-amber-900/60 text-amber-200 border border-amber-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          BEKLİYOR
                        </span>
                      )}
                      {isBreak && (
                        <span className="bg-slate-800 text-slate-300 border border-slate-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Coffee className="w-3.5 h-3.5" />
                          MOLA / KİLİTLİ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Müşteri ve Hizmet Detayı */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#334155]/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white tracking-wide">
                          {apt.customerName}
                        </span>
                        {apt.visitCount && apt.visitCount > 1 && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md font-bold">
                            {apt.visitCount}. Geliş
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                        <span className="font-semibold text-[#FDE68A]">{apt.serviceName}</span>
                        <span className="text-slate-500">•</span>
                        <span className="font-bold text-white">₺{apt.price}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 font-mono">
                      {apt.customerPhone}
                    </div>
                  </div>

                  {/* Yapılandırılmış Berber Tercih Çipleri (Etiketler) */}
                  {(apt.structuredTags && apt.structuredTags.length > 0) || apt.notes ? (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {apt.structuredTags?.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="bg-[#334155] text-slate-200 border border-slate-600 text-[11px] font-medium px-2.5 py-0.5 rounded-lg flex items-center gap-1"
                        >
                          <span className="text-amber-400">🏷️</span> {tag}
                        </span>
                      ))}
                      {apt.notes && (
                        <span className="text-[11px] text-amber-300/90 italic bg-amber-950/40 border border-amber-900/60 px-2.5 py-0.5 rounded-lg">
                          📝 {apt.notes}
                        </span>
                      )}
                    </div>
                  ) : null}

                  {/* TEK DOKUNUŞ AKSİYON BARI (MİN 48PX DOKUNMA ALANI) */}
                  {!isBreak && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[#334155]">
                      {/* 1. Müşteri Geldi */}
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(apt.id, 'confirmed')}
                        className={`min-h-[48px] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                          isConfirmed
                            ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/50'
                            : 'bg-[#1E293B] hover:bg-[#334155] text-blue-300 border border-blue-900/50'
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Geldi</span>
                      </button>

                      {/* 2. Koltukta / Başla */}
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(apt.id, 'in_chair')}
                        className={`min-h-[48px] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                          isInChair
                            ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/50'
                            : 'bg-[#1E293B] hover:bg-[#334155] text-purple-300 border border-purple-900/50'
                        }`}
                      >
                        <Scissors className="w-4 h-4" />
                        <span>Koltukta</span>
                      </button>

                      {/* 3. Tamamla (Akıllı Kilitli) */}
                      <button
                        type="button"
                        onClick={() => handleRequestComplete(apt)}
                        className={`min-h-[48px] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/50'
                            : 'bg-[#1E293B] hover:bg-[#334155] text-emerald-300 border border-emerald-900/50'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Tamamla</span>
                      </button>

                      {/* 4. No-Show / Gelmedi */}
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(apt.id, 'no_show')}
                        className={`min-h-[48px] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                          isNoShow
                            ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400/50'
                            : 'bg-[#1E293B] hover:bg-[#334155] text-rose-300 border border-rose-900/50'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Gelmedi</span>
                      </button>

                      {/* 5. WhatsApp Hızlı İletişim */}
                      <button
                        type="button"
                        onClick={() =>
                          openWhatsApp(apt.customerPhone, apt.customerName, apt.startTime, apt.serviceName)
                        }
                        className="min-h-[48px] col-span-2 sm:col-span-1 rounded-xl text-xs font-bold bg-[#1E293B] hover:bg-emerald-950 text-emerald-400 border border-emerald-900/60 transition flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 4. B) GÖRÜNÜM: GENİŞ EKRAN ÇOK SÜTUNLU KOLTUK MATRİSİ (MATRIX) */}
      {viewMode === 'matrix' && (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[750px]">
            {/* Kolon Başlıkları (Usta İsimleri) */}
            <div
              className="grid gap-3 border-b border-[#2B384E] pb-3 mb-3"
              style={{
                gridTemplateColumns: `90px repeat(${activeStaffColumns.length}, minmax(180px, 1fr))`,
              }}
            >
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                Saat
              </div>
              {activeStaffColumns.map((staff) => (
                <div key={staff.id} className="text-center bg-[#1E293B] py-2 px-3 rounded-2xl border border-[#334155]">
                  <span className="font-black text-sm text-white block">{staff.name}</span>
                  <span className="text-[11px] text-[#FDE68A] block">{staff.title}</span>
                </div>
              ))}
            </div>

            {/* Saat Satırları */}
            <div className="space-y-2">
              {HOURS.map((hour) => {
                return (
                  <div
                    key={hour}
                    className="grid gap-3 items-center"
                    style={{
                      gridTemplateColumns: `90px repeat(${activeStaffColumns.length}, minmax(180px, 1fr))`,
                    }}
                  >
                    {/* Sol Saat */}
                    <div className="text-xs font-mono font-bold text-slate-400 py-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {hour}
                    </div>

                    {/* Usta Hücreleri */}
                    {activeStaffColumns.map((staff) => {
                      const apt = dayAppointments.find(
                        (a) => a.staffId === staff.id && a.startTime === hour
                      );

                      if (apt) {
                        const isInChair = apt.status === 'in_chair';
                        const isCompleted = apt.status === 'completed';
                        const isNoShow = apt.status === 'no_show';

                        return (
                          <div
                            key={apt.id}
                            onClick={() => setSelectedApt(apt)}
                            className={`rounded-2xl p-3 border transition cursor-pointer shadow-md min-h-[64px] flex flex-col justify-between ${
                              isInChair
                                ? 'bg-purple-900/60 border-purple-400 ring-2 ring-purple-400/30'
                                : isCompleted
                                ? 'bg-emerald-950/40 border-emerald-800'
                                : isNoShow
                                ? 'bg-rose-950/40 border-rose-800'
                                : 'bg-[#1E293B] border-[#334155] hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-white truncate">
                                {apt.customerName}
                              </span>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                                  isInChair
                                    ? 'bg-purple-700 text-white'
                                    : isCompleted
                                    ? 'bg-emerald-800 text-emerald-200'
                                    : isNoShow
                                    ? 'bg-rose-800 text-rose-200'
                                    : 'bg-amber-800/80 text-amber-200'
                                }`}
                              >
                                {isInChair
                                  ? 'Koltukta'
                                  : isCompleted
                                  ? 'Bitti'
                                  : isNoShow
                                  ? 'Gelmedi'
                                  : 'Bekliyor'}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-300 truncate mt-1">
                              {apt.serviceName} • <span className="font-bold text-[#FDE68A]">₺{apt.price}</span>
                            </div>
                          </div>
                        );
                      }

                      // Boş Koltuk: "+ Randevu"
                      return (
                        <div
                          key={`${staff.id}-${hour}`}
                          onClick={() => {
                            setModalStaffId(staff.id);
                            setModalSlotTime(hour);
                            setModalType('appointment');
                          }}
                          className="bg-[#151D2A] border border-dashed border-[#2B384E] hover:border-[#D97706] rounded-2xl py-3 px-3 text-center text-xs text-slate-400 hover:text-white cursor-pointer transition flex items-center justify-center gap-1 min-h-[64px]"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-500" />
                          <span>+ Randevu Yaz</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. AKILLI KİLİT UYARI MODALI: ZAMANI GELMEDEN TAMAMLAMA UYARISI */}
      {earlyCompleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151D2A] border border-[#D97706] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-7 h-7 shrink-0" />
              <div>
                <h3 className="text-base font-black">Erken Tamamlama Uyarısı</h3>
                <p className="text-xs text-slate-400">Akıllı Durum Kilit Mekanizması</p>
              </div>
            </div>

            <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-3.5 text-xs text-slate-300 space-y-1.5">
              <p>
                <strong className="text-white">{earlyCompleteTarget.customerName}</strong> isimli müşterinin randevu bitiş saati{' '}
                <strong className="text-[#FDE68A]">{earlyCompleteTarget.endTime}</strong> olarak planlanmıştır.
              </p>
              <p className="text-amber-300">
                ⚠️ Randevu süresi henüz dolmadı. Müşteri işlemi gerçekten erken mi bitti?
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEarlyCompleteTarget(null)}
                className="flex-1 min-h-[44px] rounded-xl bg-[#1E293B] hover:bg-[#334155] text-slate-300 font-bold text-xs transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(earlyCompleteTarget.id, 'completed');
                  setEarlyCompleteTarget(null);
                }}
                className="flex-1 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition shadow-md"
              >
                Evet, Erken Tamamla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. HIZLI RANDEVU OLUŞTURMA MODALI */}
      {modalSlotTime && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151D2A] border border-[#2B384E] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-[#2B384E] pb-3">
              <div>
                <h3 className="text-lg font-black text-white">Yeni Randevu Yaz</h3>
                <p className="text-xs text-slate-400">
                  {currentDate} • Saat {modalSlotTime}
                </p>
              </div>
              <button
                onClick={() => setModalSlotTime(null)}
                className="text-slate-400 hover:text-white font-bold text-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Müşteri Adı Soyadı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Burak Kaya"
                  value={quickCustomerName}
                  onChange={(e) => setQuickCustomerName(e.target.value)}
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#D97706] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Telefon Numarası *</label>
                <input
                  type="tel"
                  required
                  placeholder="0532 123 45 67"
                  value={quickCustomerPhone}
                  onChange={(e) => setQuickCustomerPhone(e.target.value)}
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#D97706] min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Usta *</label>
                  <select
                    value={modalStaffId}
                    onChange={(e) => setModalStaffId(e.target.value)}
                    className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D97706] min-h-[44px]"
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Hizmet *</label>
                  <select
                    value={quickServiceId}
                    onChange={(e) => setQuickServiceId(e.target.value)}
                    className="w-full bg-[#1E293B] border border-[#334155] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D97706] min-h-[44px]"
                  >
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.name} (₺{srv.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hızlı Tercih Çipleri */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Berber Tercih Çipleri</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Ense: Natürel', 'Fade: 1 Numara', 'Sessiz Tıraş', 'İkram: Sade Kahve', 'İkram: Çay'].map((tag) => {
                    const isSelected = quickTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setQuickTags(quickTags.filter((t) => t !== tag));
                          } else {
                            setQuickTags([...quickTags, tag]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                          isSelected
                            ? 'bg-[#D97706] border-[#D97706] text-white'
                            : 'bg-[#1E293B] border-[#334155] text-slate-300 hover:text-white'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalSlotTime(null)}
                  className="flex-1 min-h-[44px] rounded-xl bg-[#1E293B] text-slate-300 font-bold hover:bg-[#334155] transition"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-black transition shadow-md"
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
