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
    <div className="bg-white border border-[#EBE7DF] rounded-3xl p-4 sm:p-6 shadow-xs space-y-6 text-stone-900">
      {/* 1. ÜST BAŞLIK & METRİK BARI (SICAK KLASİK TASARIM) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#EBE7DF]/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#B86B35] animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <Scissors className="w-6 h-6 text-[#B86B35]" />
              Günlük Ajanda & Koltuk Operasyonu
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Tek dokunuşla randevu durumu yönetimi, berber tercih etiketleri ve canlı koltuk takibi.
          </p>
        </div>

        {/* Canlı Kasa ve Durum Sayaçları */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
          <div className="bg-[#FAF3EE] border border-[#B86B35]/20 px-3.5 py-2.5 rounded-2xl text-center">
            <span className="text-[10px] text-[#B86B35] uppercase tracking-wider block font-bold">Koltukta</span>
            <span className="text-base font-black text-[#B86B35] flex items-center justify-center gap-1">
              <Scissors className="w-3.5 h-3.5" /> {inChairCount}
            </span>
          </div>

          <div className="bg-[#F8F6F0] border border-[#EBE7DF] px-3.5 py-2.5 rounded-2xl text-center">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Bekleyen</span>
            <span className="text-base font-extrabold text-[#0369A1] flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {pendingCount}
            </span>
          </div>

          <div className="bg-[#F8F6F0] border border-[#EBE7DF] px-3.5 py-2.5 rounded-2xl text-center">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Tamamlanan</span>
            <span className="text-base font-extrabold text-[#1B6E37] flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {completedCount}
            </span>
          </div>

          <div className="bg-[#FAF3EE] border border-[#B86B35]/40 px-3.5 py-2.5 rounded-2xl text-center">
            <span className="text-[10px] text-[#B86B35] uppercase tracking-wider block font-bold">Bugünkü Kasa</span>
            <span className="text-base font-black text-[#B86B35]">
              ₺{totalRevenue.toLocaleString('tr-TR')}
            </span>
          </div>
        </div>
      </div>

      {/* 2. KONTROL ARAÇLARI: TARİH GEZGİNİ, FİLTRELER VE GÖRÜNÜM GEÇİŞİ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Sol: Tarih Gezgini */}
        <div className="flex items-center gap-2 bg-[#F8F6F0] px-3 py-1.5 rounded-2xl border border-[#EBE7DF]">
          <button
            onClick={() => changeDay(-1)}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-white rounded-xl transition text-stone-600 font-bold active:scale-95"
            title="Önceki Gün"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-xs sm:text-sm font-bold text-stone-900 px-2 min-w-[150px] text-center">
            {formattedDate}
          </span>

          <button
            onClick={() => changeDay(1)}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-white rounded-xl transition text-stone-600 font-bold active:scale-95"
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
              className="bg-[#F8F6F0] border border-[#EBE7DF] text-xs font-bold text-stone-800 rounded-2xl px-3 py-2 min-h-[44px] focus:outline-none focus:border-[#B86B35]"
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
        <div className="flex items-center gap-1 bg-[#F8F6F0] p-1 rounded-2xl border border-[#EBE7DF]">
          <button
            onClick={() => setViewMode('feed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 min-h-[44px] ${
              viewMode === 'feed'
                ? 'bg-[#B86B35] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Kart Akışı</span>
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 min-h-[44px] ${
              viewMode === 'matrix'
                ? 'bg-[#B86B35] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Koltuk Matrisi</span>
          </button>
        </div>
      </div>

      {/* 3. DURUM FİLTRE BUTONLARI */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap min-h-[44px] transition ${
            statusFilter === 'all'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-[#F8F6F0] text-stone-600 hover:text-stone-900 border border-[#EBE7DF]'
          }`}
        >
          Tümü ({dayAppointments.filter((a) => a.status !== 'cancelled').length})
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap min-h-[44px] transition flex items-center gap-1.5 ${
            statusFilter === 'pending'
              ? 'bg-[#E0F2FE] text-[#0369A1] border border-blue-300 font-black shadow-xs'
              : 'bg-[#F8F6F0] text-stone-600 hover:text-blue-700 border border-[#EBE7DF]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Bekleyen ({pendingCount})
        </button>

        <button
          onClick={() => setStatusFilter('in_action')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap min-h-[44px] transition flex items-center gap-1.5 ${
            statusFilter === 'in_action'
              ? 'bg-[#FEF3C7] text-[#92400E] border-2 border-[#B86B35] font-black shadow-xs'
              : 'bg-[#F8F6F0] text-stone-600 hover:text-amber-800 border border-[#EBE7DF]'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          Koltukta ({inChairCount})
        </button>

        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap min-h-[44px] transition flex items-center gap-1.5 ${
            statusFilter === 'completed'
              ? 'bg-[#E7F6EC] text-[#1B6E37] border border-emerald-300 font-black shadow-xs'
              : 'bg-[#F8F6F0] text-stone-600 hover:text-emerald-700 border border-[#EBE7DF]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Tamamlandı ({completedCount})
        </button>

        <button
          onClick={() => setStatusFilter('no_show')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap min-h-[44px] transition flex items-center gap-1.5 ${
            statusFilter === 'no_show'
              ? 'bg-rose-100 text-rose-800 border border-rose-300 font-black shadow-xs'
              : 'bg-[#F8F6F0] text-stone-600 hover:text-rose-700 border border-[#EBE7DF]'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Gelmedi ({noShowCount})
        </button>

        <button
          onClick={() => {
            setModalSlotTime('12:00');
            setModalType('appointment');
          }}
          className="ml-auto px-4 py-2 rounded-xl font-bold bg-[#B86B35] hover:bg-[#A35C2B] text-white flex items-center gap-1.5 min-h-[44px] shrink-0 active:scale-95 transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          + Hızlı Randevu Yaz
        </button>
      </div>

      {/* 4. A) GÖRÜNÜM: MOBİL & TABLET İÇİN AKILLI KART AKIŞI (FEED) */}
      {viewMode === 'feed' && (
        <div className="space-y-3.5">
          {filteredAppointments.length === 0 ? (
            <div className="bg-[#F8F6F0] border border-dashed border-[#EBE7DF] rounded-3xl p-10 text-center space-y-3">
              <Armchair className="w-12 h-12 text-stone-400 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">Bu filtrede randevu bulunmuyor</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {formattedDate} tarihi için seçili kriterde kayıtlı işlem yok.
              </p>
              <button
                onClick={() => {
                  setModalSlotTime('14:00');
                  setModalType('appointment');
                }}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#B86B35] hover:bg-[#A35C2B] text-white font-bold text-xs shadow-xs"
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
                  className={`border rounded-2xl p-4 sm:p-5 transition space-y-3.5 shadow-xs ${
                    isInChair
                      ? 'bg-[#FAF3EE] border-2 border-[#B86B35] ring-2 ring-[#B86B35]/20 shadow-sm'
                      : isCompleted
                      ? 'bg-[#F8F6F0]/80 border-[#EBE7DF]'
                      : isNoShow
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-white border-[#EBE7DF] hover:border-stone-400'
                  }`}
                >
                  {/* Kart Üst Barı: Saat, Usta ve Durum Rozeti */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-stone-900 text-white px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs">
                        <Clock className="w-3.5 h-3.5 text-[#FDE68A]" />
                        {apt.startTime} - {apt.endTime}
                      </div>

                      <span className="text-xs text-stone-600 font-bold flex items-center gap-1 bg-[#F8F6F0] px-2.5 py-1 rounded-lg border border-[#EBE7DF]">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        {apt.staffName || 'Usta'}
                      </span>
                    </div>

                    {/* Çift Gösterimli Durum Rozeti (İkon + Metin + Renk) */}
                    <div>
                      {isInChair && (
                        <span className="bg-[#FEF3C7] text-[#92400E] border border-amber-300 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                          <Scissors className="w-3.5 h-3.5" />
                          KOLTUKTA (İŞLEMDE)
                        </span>
                      )}
                      {isCompleted && (
                        <span className="bg-[#E7F6EC] text-[#1B6E37] border border-emerald-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          TAMAMLANDI
                        </span>
                      )}
                      {isNoShow && (
                        <span className="bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          GELMEDİ (NO-SHOW)
                        </span>
                      )}
                      {(isConfirmed || isPending) && !isBreak && (
                        <span className="bg-[#E0F2FE] text-[#0369A1] border border-blue-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          BEKLİYOR
                        </span>
                      )}
                      {isBreak && (
                        <span className="bg-stone-100 text-stone-600 border border-stone-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Coffee className="w-3.5 h-3.5" />
                          MOLA / KİLİTLİ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Müşteri ve Hizmet Detayı */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#EBE7DF]/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-stone-900 tracking-tight">
                          {apt.customerName}
                        </span>
                        {apt.visitCount && apt.visitCount > 1 && (
                          <span className="text-[10px] bg-[#FAF3EE] text-[#B86B35] border border-[#B86B35]/30 px-2 py-0.5 rounded-md font-bold">
                            {apt.visitCount}. Geliş
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-600 mt-0.5 flex items-center gap-2">
                        <span className="font-bold text-[#B86B35]">{apt.serviceName}</span>
                        <span className="text-stone-300">•</span>
                        <span className="font-extrabold text-stone-900">₺{apt.price}</span>
                      </div>
                    </div>

                    <div className="text-xs text-stone-500 font-mono">
                      {apt.customerPhone}
                    </div>
                  </div>

                  {/* Yapılandırılmış Berber Tercih Çipleri (Etiketler) */}
                  {(apt.structuredTags && apt.structuredTags.length > 0) || apt.notes ? (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {apt.structuredTags?.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="bg-[#F8F6F0] text-stone-700 border border-[#EBE7DF] text-[11px] font-medium px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs"
                        >
                          <span className="text-[#B86B35]">🏷️</span> {tag}
                        </span>
                      ))}
                      {apt.notes && (
                        <span className="text-[11px] text-stone-600 italic bg-[#FAF3EE] border border-[#B86B35]/20 px-2.5 py-0.5 rounded-lg">
                          📝 {apt.notes}
                        </span>
                      )}
                    </div>
                  ) : null}

                  {/* TEK DOKUNUŞ AKSİYON BARI (MİN 48PX DOKUNMA ALANI) */}
                  {!isBreak && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[#EBE7DF]/80">
                      {/* 1. Müşteri Geldi */}
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(apt.id, 'confirmed')}
                        className={`min-h-[48px] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                          isConfirmed
                            ? 'bg-[#E0F2FE] text-[#0369A1] border-2 border-[#0369A1] shadow-2xs'
                            : 'bg-[#F8F6F0] hover:bg-[#E0F2FE] text-[#0369A1] border border-[#EBE7DF]'
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
                            ? 'bg-[#FEF3C7] text-[#92400E] border-2 border-[#B86B35] shadow-xs'
                            : 'bg-[#F8F6F0] hover:bg-[#FEF3C7] text-[#92400E] border border-[#EBE7DF]'
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
                            ? 'bg-[#E7F6EC] text-[#1B6E37] border-2 border-[#1B6E37] shadow-2xs'
                            : 'bg-[#F8F6F0] hover:bg-[#E7F6EC] text-[#1B6E37] border border-[#EBE7DF]'
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
                            ? 'bg-rose-100 text-rose-800 border-2 border-rose-400 shadow-2xs'
                            : 'bg-[#F8F6F0] hover:bg-rose-50 text-rose-700 border border-[#EBE7DF]'
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
                        className="min-h-[48px] col-span-2 sm:col-span-1 rounded-xl text-xs font-bold bg-[#E7F6EC] hover:bg-emerald-100 text-[#1B6E37] border border-emerald-200 transition flex items-center justify-center gap-1.5 active:scale-95"
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
              className="grid gap-3 border-b border-[#EBE7DF] pb-3 mb-3"
              style={{
                gridTemplateColumns: `90px repeat(${activeStaffColumns.length}, minmax(180px, 1fr))`,
              }}
            >
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center">
                Saat
              </div>
              {activeStaffColumns.map((staff) => (
                <div key={staff.id} className="text-center bg-[#F8F6F0] py-2 px-3 rounded-2xl border border-[#EBE7DF]">
                  <span className="font-bold text-sm text-stone-900 block">{staff.name}</span>
                  <span className="text-[11px] text-[#B86B35] font-semibold block">{staff.title}</span>
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
                    <div className="text-xs font-mono font-bold text-stone-500 py-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
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
                            className={`rounded-2xl p-3 border transition cursor-pointer shadow-xs min-h-[64px] flex flex-col justify-between ${
                              isInChair
                                ? 'bg-[#FEF3C7]/60 border-2 border-[#B86B35] ring-2 ring-[#B86B35]/20'
                                : isCompleted
                                ? 'bg-[#E7F6EC]/60 border-emerald-300'
                                : isNoShow
                                ? 'bg-rose-50 border-rose-200'
                                : 'bg-white border-[#EBE7DF] hover:border-stone-400'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-stone-900 truncate">
                                {apt.customerName}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                  isInChair
                                    ? 'bg-[#FEF3C7] text-[#92400E]'
                                    : isCompleted
                                    ? 'bg-[#E7F6EC] text-[#1B6E37]'
                                    : isNoShow
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-[#E0F2FE] text-[#0369A1]'
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

                            <div className="text-[11px] text-stone-500 truncate mt-1">
                              {apt.serviceName} • <span className="font-bold text-[#B86B35]">₺{apt.price}</span>
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
                          className="bg-white border border-dashed border-[#EBE7DF] hover:border-[#B86B35] rounded-2xl py-3 px-3 text-center text-xs text-stone-400 hover:text-stone-800 cursor-pointer transition flex items-center justify-center gap-1 min-h-[64px]"
                        >
                          <Plus className="w-3.5 h-3.5 text-stone-400" />
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

      {/* 5. AKILLI KİLİT UYARI MODALI */}
      {earlyCompleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#B86B35] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl text-stone-900">
            <div className="flex items-center gap-3 text-[#B86B35]">
              <AlertCircle className="w-7 h-7 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-stone-900">Erken Tamamlama Uyarısı</h3>
                <p className="text-xs text-stone-500">Akıllı Durum Kilit Mekanizması</p>
              </div>
            </div>

            <div className="bg-[#FAF3EE] border border-[#B86B35]/20 rounded-2xl p-3.5 text-xs text-stone-700 space-y-1.5">
              <p>
                <strong className="text-stone-900">{earlyCompleteTarget.customerName}</strong> isimli müşterinin randevu bitiş saati{' '}
                <strong className="text-[#B86B35]">{earlyCompleteTarget.endTime}</strong> olarak planlanmıştır.
              </p>
              <p className="text-amber-800 font-semibold">
                ⚠️ Randevu süresi henüz dolmadı. Müşteri işlemi gerçekten erken mi bitti?
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEarlyCompleteTarget(null)}
                className="flex-1 min-h-[44px] rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(earlyCompleteTarget.id, 'completed');
                  setEarlyCompleteTarget(null);
                }}
                className="flex-1 min-h-[44px] rounded-xl bg-[#1B6E37] hover:bg-emerald-800 text-white font-bold text-xs transition shadow-xs"
              >
                Evet, Erken Tamamla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. HIZLI RANDEVU OLUŞTURMA MODALI */}
      {modalSlotTime && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE7DF] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl text-stone-900">
            <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3">
              <div>
                <h3 className="text-lg font-black text-stone-900">Yeni Randevu Yaz</h3>
                <p className="text-xs text-stone-500">
                  {currentDate} • Saat {modalSlotTime}
                </p>
              </div>
              <button
                onClick={() => setModalSlotTime(null)}
                className="text-stone-400 hover:text-stone-800 font-bold text-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Müşteri Adı Soyadı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Burak Kaya"
                  value={quickCustomerName}
                  onChange={(e) => setQuickCustomerName(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2.5 text-stone-900 focus:bg-white focus:outline-none focus:border-[#B86B35] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Telefon Numarası *</label>
                <input
                  type="tel"
                  required
                  placeholder="0532 123 45 67"
                  value={quickCustomerPhone}
                  onChange={(e) => setQuickCustomerPhone(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2.5 text-stone-900 focus:bg-white focus:outline-none focus:border-[#B86B35] min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Usta *</label>
                  <select
                    value={modalStaffId}
                    onChange={(e) => setModalStaffId(e.target.value)}
                    className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2 text-stone-900 focus:bg-white focus:outline-none focus:border-[#B86B35] min-h-[44px]"
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Hizmet *</label>
                  <select
                    value={quickServiceId}
                    onChange={(e) => setQuickServiceId(e.target.value)}
                    className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2 text-stone-900 focus:bg-white focus:outline-none focus:border-[#B86B35] min-h-[44px]"
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
                <label className="block text-stone-700 font-bold mb-1">Berber Tercih Çipleri</label>
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
                            ? 'bg-[#FAF3EE] border-[#B86B35] text-[#B86B35]'
                            : 'bg-[#F8F6F0] border-[#EBE7DF] text-stone-600 hover:text-stone-900'
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
                  className="flex-1 min-h-[44px] rounded-xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 transition"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-[#B86B35] hover:bg-[#A35C2B] text-white font-bold transition shadow-xs"
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
