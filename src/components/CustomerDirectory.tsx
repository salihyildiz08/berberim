'use client';

import React, { useState } from 'react';
import { CustomerProfile, Staff, Service, Appointment } from '@/types';
import {
  Search,
  Plus,
  Phone,
  Calendar,
  Star,
  Scissors,
  User,
  Clock,
  Sparkles,
  Edit3,
  Check,
  ChevronRight,
  MessageCircle,
  Repeat,
  CalendarDays,
  CheckCircle2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface CustomerDirectoryProps {
  customers: CustomerProfile[];
  staffList: Staff[];
  services: Service[];
  appointments?: Appointment[];
  onAddCustomer: (newCustomer: Omit<CustomerProfile, 'id' | 'createdAt'>) => void;
  onUpdateCustomerNote: (customerId: string, note: string) => void;
  onUpdateCustomerStaff?: (customerId: string, staffName: string, staffId?: string) => void;
  onAddBatchAppointments?: (appointments: Omit<Appointment, 'id' | 'createdAt'>[]) => void;
}

export interface RecurringDateItem {
  id: string;
  dateStr: string;
  formatted: string;
  dayOfWeek: number;
  isOriginalSunday: boolean;
  shiftedTo?: 'prev' | 'next';
  originalSundayDateStr?: string;
}

// Periyodik Randevu Tarihleri Üretici Fonksiyonu (Pazar Günü Otomatik Kaydırmalı)
function generateRecurringDates(
  type: 'monthly_day' | 'interval_days',
  dayOrInterval: number,
  months: number,
  sundayShift: 'prev_day' | 'next_day',
  baseDateStr?: string
): RecurringDateItem[] {
  const dates: RecurringDateItem[] = [];
  const start = baseDateStr ? new Date(baseDateStr) : new Date();

  if (type === 'monthly_day') {
    const targetDay = Math.min(31, Math.max(1, dayOrInterval));
    let currentYear = start.getFullYear();
    let currentMonth = start.getMonth();

    if (start.getDate() > targetDay) {
      currentMonth++;
    }

    for (let i = 0; i < months; i++) {
      const tempDate = new Date(currentYear, currentMonth + i, 1);
      const lastDayOfMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getDate();
      const actualDay = Math.min(targetDay, lastDayOfMonth);
      const d = new Date(tempDate.getFullYear(), tempDate.getMonth(), actualDay);

      const isSunday = d.getDay() === 0;
      const originalSundayDateStr = isSunday ? d.toISOString().split('T')[0] : undefined;
      let shiftedTo: 'prev' | 'next' | undefined = undefined;

      if (isSunday) {
        if (sundayShift === 'prev_day') {
          d.setDate(d.getDate() - 1); // Cumartesi
          shiftedTo = 'prev';
        } else {
          d.setDate(d.getDate() + 1); // Pazartesi
          shiftedTo = 'next';
        }
      }

      const dateStr = d.toISOString().split('T')[0];
      const formatted = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' });
      dates.push({
        id: `rec-${i}`,
        dateStr,
        formatted,
        dayOfWeek: d.getDay(),
        isOriginalSunday: isSunday,
        shiftedTo,
        originalSundayDateStr,
      });
    }
  } else {
    const interval = Math.max(1, dayOrInterval);
    const totalDays = months * 30;
    let curr = new Date(start);
    let i = 0;

    while (dates.length < Math.max(months, Math.floor(totalDays / interval))) {
      const d = new Date(curr);
      const isSunday = d.getDay() === 0;
      const originalSundayDateStr = isSunday ? d.toISOString().split('T')[0] : undefined;
      let shiftedTo: 'prev' | 'next' | undefined = undefined;

      if (isSunday) {
        if (sundayShift === 'prev_day') {
          d.setDate(d.getDate() - 1); // Cumartesi
          shiftedTo = 'prev';
        } else {
          d.setDate(d.getDate() + 1); // Pazartesi
          shiftedTo = 'next';
        }
      }

      const dateStr = d.toISOString().split('T')[0];
      const formatted = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' });
      dates.push({
        id: `rec-${i}`,
        dateStr,
        formatted,
        dayOfWeek: d.getDay(),
        isOriginalSunday: isSunday,
        shiftedTo,
        originalSundayDateStr,
      });

      curr = new Date(curr.getTime() + interval * 24 * 60 * 60 * 1000);
      i++;
      if (dates.length >= 24) break;
    }
  }

  return dates;
}

export const CustomerDirectory: React.FC<CustomerDirectoryProps> = ({
  customers,
  staffList,
  services,
  appointments = [],
  onAddCustomer,
  onUpdateCustomerNote,
  onUpdateCustomerStaff,
  onAddBatchAppointments,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  // 1. Yeni Müşteri Modalı State'leri
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [favService, setFavService] = useState(services[0]?.name || '');
  const [favStaff, setFavStaff] = useState(staffList[0]?.name || '');
  const [specialNotes, setSpecialNotes] = useState('');

  // Otomatik Periyodik Randevu Serisi State'leri (Yeni Müşteri İçin)
  const [isRecurringEnabled, setIsRecurringEnabled] = useState(false);
  const [recurringType, setRecurringType] = useState<'monthly_day' | 'interval_days'>('monthly_day');
  const [monthlyDay, setMonthlyDay] = useState<number>(20); // Her ayın 20'si
  const [intervalDays, setIntervalDays] = useState<number>(20); // Her 20 günde bir
  const [aptTime, setAptTime] = useState<string>('16:00'); // Saat 16:00
  const [durationMonths, setDurationMonths] = useState<number>(5); // 5 Aylık Seri
  const [sundayShift, setSundayShift] = useState<'prev_day' | 'next_day'>('next_day'); // Pazar günleri ne yapılsın: Pazartesi mi Cumartesi mi
  const [newCustomOverrides, setNewCustomOverrides] = useState<Record<number, { dateStr: string; formatted: string; shiftedTo: 'prev' | 'next' }>>({});

  // 2. Mevcut Müşteri İçin Seri Randevu Modalı State'leri
  const [showRecurringModalForExisting, setShowRecurringModalForExisting] = useState(false);
  const [existingCustService, setExistingCustService] = useState(services[0]?.id || '');
  const [existingCustStaff, setExistingCustStaff] = useState(staffList[0]?.id || '');
  const [existingRecurringType, setExistingRecurringType] = useState<'monthly_day' | 'interval_days'>('monthly_day');
  const [existingMonthlyDay, setExistingMonthlyDay] = useState<number>(20);
  const [existingIntervalDays, setExistingIntervalDays] = useState<number>(20);
  const [existingAptTime, setExistingAptTime] = useState<string>('16:00');
  const [existingDurationMonths, setExistingDurationMonths] = useState<number>(5);
  const [existingSundayShift, setExistingSundayShift] = useState<'prev_day' | 'next_day'>('next_day');
  const [existingCustomOverrides, setExistingCustomOverrides] = useState<Record<number, { dateStr: string; formatted: string; shiftedTo: 'prev' | 'next' }>>({});

  // Not düzenleme modu
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  // Yeni Müşteri İçin Canlı Tarih Hesaplama
  const rawDatesForNew = generateRecurringDates(
    recurringType,
    recurringType === 'monthly_day' ? monthlyDay : intervalDays,
    durationMonths,
    sundayShift
  );

  const previewDatesForNew = rawDatesForNew.map((item, idx) => {
    if (newCustomOverrides[idx]) {
      return {
        ...item,
        dateStr: newCustomOverrides[idx].dateStr,
        formatted: newCustomOverrides[idx].formatted,
        shiftedTo: newCustomOverrides[idx].shiftedTo,
      };
    }
    return item;
  });

  // Satır bazında Cumartesi / Pazartesi değiştirme
  const shiftNewRowDate = (idx: number, direction: 'prev' | 'next') => {
    const item = rawDatesForNew[idx];
    const sundayDate = item.originalSundayDateStr ? new Date(item.originalSundayDateStr) : new Date(item.dateStr);
    const target = new Date(sundayDate);
    if (direction === 'prev') {
      target.setDate(sundayDate.getDate() - 1); // Cumartesi
    } else {
      target.setDate(sundayDate.getDate() + 1); // Pazartesi
    }

    const dateStr = target.toISOString().split('T')[0];
    const formatted = target.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' });
    setNewCustomOverrides((prev) => ({
      ...prev,
      [idx]: { dateStr, formatted, shiftedTo: direction },
    }));
  };

  // Mevcut Müşteri İçin Canlı Tarih Hesaplama
  const rawDatesForExisting = generateRecurringDates(
    existingRecurringType,
    existingRecurringType === 'monthly_day' ? existingMonthlyDay : existingIntervalDays,
    existingDurationMonths,
    existingSundayShift
  );

  const previewDatesForExisting = rawDatesForExisting.map((item, idx) => {
    if (existingCustomOverrides[idx]) {
      return {
        ...item,
        dateStr: existingCustomOverrides[idx].dateStr,
        formatted: existingCustomOverrides[idx].formatted,
        shiftedTo: existingCustomOverrides[idx].shiftedTo,
      };
    }
    return item;
  });

  const shiftExistingRowDate = (idx: number, direction: 'prev' | 'next') => {
    const item = rawDatesForExisting[idx];
    const sundayDate = item.originalSundayDateStr ? new Date(item.originalSundayDateStr) : new Date(item.dateStr);
    const target = new Date(sundayDate);
    if (direction === 'prev') {
      target.setDate(sundayDate.getDate() - 1); // Cumartesi
    } else {
      target.setDate(sundayDate.getDate() + 1); // Pazartesi
    }

    const dateStr = target.toISOString().split('T')[0];
    const formatted = target.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' });
    setExistingCustomOverrides((prev) => ({
      ...prev,
      [idx]: { dateStr, formatted, shiftedTo: direction },
    }));
  };

  // Yeni Müşteri Formu Gönderildiğinde
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const matchedStaff = staffList.find((s) => s.name === favStaff) || staffList[0];
    const matchedService = services.find((s) => s.name === favService) || services[0];

    // Müşteriyi kaydet
    onAddCustomer({
      salonId: 'salon-1',
      name,
      phone,
      totalVisits: isRecurringEnabled ? previewDatesForNew.length : 1,
      lastVisitDate: new Date().toISOString().split('T')[0],
      favoriteService: favService,
      favoriteStaff: favStaff,
      assignedStaffId: matchedStaff?.id,
      specialNotes,
    });

    // Otomatik Periyodik Randevuları Oluştur
    if (isRecurringEnabled && onAddBatchAppointments) {
      const [h, m] = aptTime.split(':').map(Number);
      const totalMin = h * 60 + m + matchedService.durationMinutes;
      const endH = String(Math.floor(totalMin / 60)).padStart(2, '0');
      const endM = String(totalMin % 60).padStart(2, '0');

      const batchAppointments = previewDatesForNew.map((d, idx) => ({
        salonId: 'salon-1',
        customerName: name,
        customerPhone: phone,
        staffId: matchedStaff.id,
        staffName: matchedStaff.name,
        serviceId: matchedService.id,
        serviceName: matchedService.name,
        appointmentDate: d.dateStr,
        startTime: aptTime,
        endTime: `${endH}:${endM}`,
        price: matchedService.price,
        status: 'confirmed' as const,
        notes: `VIP Periyodik Seri (${idx + 1}/${previewDatesForNew.length})${d.shiftedTo ? ` • ${d.shiftedTo === 'prev' ? 'Cumartesiye Alındı' : 'Pazartesiye Alındı'}` : ''}`,
        recurringDays: recurringType === 'interval_days' ? intervalDays : 30,
      }));

      onAddBatchAppointments(batchAppointments);
    }

    setName('');
    setPhone('');
    setSpecialNotes('');
    setIsRecurringEnabled(false);
    setNewCustomOverrides({});
    setShowAddModal(false);
  };

  // Mevcut Müşteriye Seri Randevu Oluşturma
  const handleCreateRecurringForExisting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !onAddBatchAppointments) return;

    const matchedStaff = staffList.find((s) => s.id === existingCustStaff) || staffList[0];
    const matchedService = services.find((s) => s.id === existingCustService) || services[0];

    const [h, m] = existingAptTime.split(':').map(Number);
    const totalMin = h * 60 + m + matchedService.durationMinutes;
    const endH = String(Math.floor(totalMin / 60)).padStart(2, '0');
    const endM = String(totalMin % 60).padStart(2, '0');

    const batchAppointments = previewDatesForExisting.map((d, idx) => ({
      salonId: 'salon-1',
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      staffId: matchedStaff.id,
      staffName: matchedStaff.name,
      serviceId: matchedService.id,
      serviceName: matchedService.name,
      appointmentDate: d.dateStr,
      startTime: existingAptTime,
      endTime: `${endH}:${endM}`,
      price: matchedService.price,
      status: 'confirmed' as const,
      notes: `VIP Periyodik Seri (${idx + 1}/${previewDatesForExisting.length})${d.shiftedTo ? ` • ${d.shiftedTo === 'prev' ? 'Cumartesiye Alındı' : 'Pazartesiye Alındı'}` : ''}`,
      recurringDays: existingRecurringType === 'interval_days' ? existingIntervalDays : 30,
    }));

    onAddBatchAppointments(batchAppointments);
    setExistingCustomOverrides({});
    setShowRecurringModalForExisting(false);
  };

  const handleSaveNote = (customerId: string) => {
    onUpdateCustomerNote(customerId, tempNote);
    setEditingNoteId(null);
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer({ ...selectedCustomer, specialNotes: tempNote });
    }
  };

  // Seçili müşterinin yaklaşan randevuları
  const selectedCustomerAppointments = selectedCustomer
    ? appointments
        .filter(
          (a) =>
            a.customerPhone.replace(/\s+/g, '') === selectedCustomer.phone.replace(/\s+/g, '') ||
            a.customerName.toLowerCase() === selectedCustomer.name.toLowerCase()
        )
        .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate))
    : [];

  return (
    <div className="space-y-6">
      {/* ÜST ARAMA VE YENİ MÜŞTERİ BUTONU */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="İsim veya telefon numarası ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-9 pr-4 py-2 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-stone-900"
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-[#B86B35] hover:bg-[#A35C2B] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" /> Yeni Müşteri Kaydet
        </button>
      </div>

      {/* MÜŞTERİ LİSTESİ VE DETAY ÇİFT KOLON GÖRÜNÜMÜ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOL: Müşteri Kartları Listesi */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold px-1">
            <span>Kayıtlı Müşteriler ({filteredCustomers.length})</span>
            <span>Sadakat & Notlar</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {filteredCustomers.map((cust) => {
              const isSelected = selectedCustomer?.id === cust.id;
              const custAptCount = appointments.filter(
                (a) =>
                  a.customerPhone.replace(/\s+/g, '') === cust.phone.replace(/\s+/g, '') ||
                  a.customerName.toLowerCase() === cust.name.toLowerCase()
              ).length;

              return (
                <div
                  key={cust.id}
                  onClick={() => {
                    setSelectedCustomer(cust);
                    const matchedStf = staffList.find((s) => s.name === cust.favoriteStaff);
                    if (matchedStf) setExistingCustStaff(matchedStf.id);
                  }}
                  className={`bg-white border rounded-xl p-4 transition-all cursor-pointer flex items-start justify-between gap-4 shadow-xs ${
                    isSelected
                      ? 'border-[#B86B35] ring-1 ring-[#B86B35] bg-[#FAF3EE]'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {cust.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-900 text-sm">{cust.name}</h4>
                        <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200/80">
                          {cust.totalVisits} Ziyaret
                        </span>
                        {custAptCount > 0 && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <Repeat className="w-3 h-3" /> {custAptCount} Randevu
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 font-mono mt-0.5">{cust.phone}</p>

                      <div className="flex items-center gap-3 text-xs text-stone-500 mt-2 flex-wrap">
                        {cust.favoriteStaff && (
                          <span>👤 Atanan Usta: <strong className="text-stone-800">{cust.favoriteStaff}</strong></span>
                        )}
                        {cust.favoriteService && (
                          <span>✂️ {cust.favoriteService}</span>
                        )}
                        <span>📅 Son Ziyaret: {cust.lastVisitDate}</span>
                      </div>

                      {cust.specialNotes && (
                        <div className="mt-2 text-xs bg-amber-50/60 text-amber-950 px-2.5 py-1 rounded-lg border border-amber-200/60 italic">
                          Berber Notu: &quot;{cust.specialNotes}&quot;
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://wa.me/90${cust.phone.replace(/[^0-9]/g, '')}`, '_blank');
                      }}
                      className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                      title="WhatsApp'tan Ulaş"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SAĞ: Seçili Müşterinin Özel Not & Detay Kartı */}
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs sticky top-20 space-y-4">
            <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3">
              Müşteri Profil Detayı
            </h3>

            {selectedCustomer ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-stone-900 text-white font-extrabold text-base flex items-center justify-center">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-stone-900">{selectedCustomer.name}</h4>
                    <p className="text-stone-500 font-mono">{selectedCustomer.phone}</p>
                    <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-1">
                      Toplam {selectedCustomer.totalVisits} Tıraş Kaydı
                    </span>
                  </div>
                </div>

                {/* ATANAN USTA & BİLGİLER */}
                <div className="space-y-2.5 bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-500 font-medium">Atanan Usta / Personel:</span>
                      <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-200">
                        {selectedCustomer.favoriteStaff ? 'Özel Atanmış' : 'Serbest'}
                      </span>
                    </div>
                    <select
                      value={selectedCustomer.favoriteStaff || ''}
                      onChange={(e) => {
                        const newStaffName = e.target.value;
                        const matched = staffList.find((s) => s.name === newStaffName);
                        if (onUpdateCustomerStaff) {
                          onUpdateCustomerStaff(selectedCustomer.id, newStaffName, matched?.id);
                        }
                        setSelectedCustomer({
                          ...selectedCustomer,
                          favoriteStaff: newStaffName,
                          assignedStaffId: matched?.id,
                        });
                      }}
                      className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900 shadow-2xs"
                    >
                      <option value="">-- Personel Seçimi (Fark Etmez) --</option>
                      {staffList.map((st) => (
                        <option key={st.id} value={st.name}>
                          ✂️ {st.name} ({st.title})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-between pt-1 border-t border-stone-200/60">
                    <span className="text-stone-500">Sık Aldığı Hizmet:</span>
                    <span className="font-bold text-stone-900">{selectedCustomer.favoriteService || 'Klasik Kesim'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Son Tıraş Tarihi:</span>
                    <span className="font-bold text-stone-900">{selectedCustomer.lastVisitDate}</span>
                  </div>
                </div>

                {/* AKTİF SIRALI RANDEVULARI */}
                {selectedCustomerAppointments.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#B86B35]" />
                        Kayıtlı Randevuları ({selectedCustomerAppointments.length}):
                      </span>
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {selectedCustomerAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="p-2 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between text-[11px]"
                        >
                          <div>
                            <span className="font-bold text-stone-900">{apt.appointmentDate}</span>
                            <span className="text-stone-500 ml-1.5 font-mono">{apt.startTime}</span>
                            <div className="text-[10px] text-stone-500">👤 {apt.staffName} • {apt.serviceName}</div>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {apt.status === 'confirmed' ? 'Onaylı' : apt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* BERBER ÖZEL KESİM NOTU DÜZENLEME */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800 flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5" /> Kesim & Tercih Notu:
                    </span>
                    {editingNoteId !== selectedCustomer.id ? (
                      <button
                        onClick={() => {
                          setEditingNoteId(selectedCustomer.id);
                          setTempNote(selectedCustomer.specialNotes || '');
                        }}
                        className="text-[11px] text-blue-700 hover:underline flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" /> Düzenle
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSaveNote(selectedCustomer.id)}
                        className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Kaydet
                      </button>
                    )}
                  </div>

                  {editingNoteId === selectedCustomer.id ? (
                    <textarea
                      rows={3}
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                      placeholder="Örn: Ense düz, sıcak su sevmez, favoriler kısa..."
                      className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  ) : (
                    <p className="text-xs text-stone-700 bg-amber-50/80 border border-amber-200/80 p-3 rounded-lg italic">
                      {selectedCustomer.specialNotes || 'Bu müşteri için henüz özel kesim notu girilmedi.'}
                    </p>
                  )}
                </div>

                {/* BU MÜŞTERİYE PERİYODİK RANDEVU SERİSİ OLUŞTUR BUTONU */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const matchedStf = staffList.find((s) => s.name === selectedCustomer.favoriteStaff);
                      if (matchedStf) setExistingCustStaff(matchedStf.id);
                      setExistingCustomOverrides({});
                      setShowRecurringModalForExisting(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#B86B35] hover:bg-[#A35C2B] text-white font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Repeat className="w-4 h-4" /> Periyodik Randevu Serisi Oluştur
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-stone-400 text-xs">
                Detayları ve randevu serilerini görmek için soldaki listeden bir müşteriye tıklayın.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1. YENİ MÜŞTERİ EKLEME VE PERİYODİK SERİ MODALI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base">Rehbere Yeni Müşteri Kaydet</h3>
                <p className="text-xs text-stone-500">Müşteri bilgileri ve opsiyonel otomatik randevu serisi</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Müşteri Ad Soyad *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Selim Güneş"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Telefon Numarası *</label>
                <input
                  type="tel"
                  required
                  placeholder="0532 000 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Atanan Personel / Usta</label>
                  <select
                    value={favStaff}
                    onChange={(e) => setFavStaff(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 text-xs font-semibold"
                  >
                    <option value="">Fark Etmez / Serbest</option>
                    {staffList.map((st) => (
                      <option key={st.id} value={st.name}>✂️ {st.name} ({st.title})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Genel Tercihi</label>
                  <select
                    value={favService}
                    onChange={(e) => setFavService(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 text-xs"
                  >
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.name}>{srv.name} (₺{srv.price})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Özel Kesim / Müşteri Notu</label>
                <textarea
                  rows={2}
                  placeholder="Örn: Ense natürel, favoriler uzun bırakılacak..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 text-xs"
                />
              </div>

              {/* 🔄 OTOMATİK SIRALI PERİYODİK RANDEVU SERİSİ ALANI */}
              <div className="bg-[#FAF3EE] border border-[#B86B35]/30 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#B86B35] text-white flex items-center justify-center font-bold">
                      <Repeat className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs">Otomatik Sıralı Randevu Serisi Oluştur</h4>
                      <p className="text-[11px] text-stone-500">Müşterinin randevuları ileriye dönük otomatik takvime işlensin</p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isRecurringEnabled}
                    onChange={(e) => setIsRecurringEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#B86B35] rounded cursor-pointer"
                  />
                </div>

                {isRecurringEnabled && (
                  <div className="pt-2 border-t border-[#B86B35]/20 space-y-3 animate-in fade-in">
                    {/* DÖNGÜ MODELİ SEÇİMİ */}
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">Döngü Modeli:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRecurringType('monthly_day');
                            setNewCustomOverrides({});
                          }}
                          className={`p-2 rounded-lg border text-left font-medium transition ${
                            recurringType === 'monthly_day'
                              ? 'bg-white border-[#B86B35] text-[#B86B35] shadow-2xs font-bold'
                              : 'bg-stone-50 border-stone-200 text-stone-700'
                          }`}
                        >
                          🗓️ Her Ayın Sabit Günü
                          <span className="block text-[10px] text-stone-500 font-normal">Örn: Her ayın 20&apos;sinde</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRecurringType('interval_days');
                            setNewCustomOverrides({});
                          }}
                          className={`p-2 rounded-lg border text-left font-medium transition ${
                            recurringType === 'interval_days'
                              ? 'bg-white border-[#B86B35] text-[#B86B35] shadow-2xs font-bold'
                              : 'bg-stone-50 border-stone-200 text-stone-700'
                          }`}
                        >
                          ⏱️ Periyodik Gün Aralığı
                          <span className="block text-[10px] text-stone-500 font-normal">Örn: Her 20 günde bir</span>
                        </button>
                      </div>
                    </div>

                    {/* GÜN VE SAAT SEÇİMİ */}
                    <div className="grid grid-cols-2 gap-2">
                      {recurringType === 'monthly_day' ? (
                        <div>
                          <label className="block text-stone-700 font-semibold mb-1">Her Ayın Hangi Günü?</label>
                          <div className="flex items-center gap-1.5">
                            <span className="text-stone-500 font-medium">Her ayın</span>
                            <input
                              type="number"
                              min={1}
                              max={31}
                              value={monthlyDay}
                              onChange={(e) => {
                                setMonthlyDay(Number(e.target.value));
                                setNewCustomOverrides({});
                              }}
                              className="w-16 bg-white border border-stone-300 rounded-lg px-2 py-1.5 text-center font-bold text-stone-900 focus:outline-none focus:border-[#B86B35]"
                            />
                            <span className="text-stone-500 font-medium">. günü</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-stone-700 font-semibold mb-1">Kaç Günde Bir?</label>
                          <div className="flex items-center gap-1.5">
                            <span className="text-stone-500 font-medium">Her</span>
                            <input
                              type="number"
                              min={5}
                              max={90}
                              value={intervalDays}
                              onChange={(e) => {
                                setIntervalDays(Number(e.target.value));
                                setNewCustomOverrides({});
                              }}
                              className="w-16 bg-white border border-stone-300 rounded-lg px-2 py-1.5 text-center font-bold text-stone-900 focus:outline-none focus:border-[#B86B35]"
                            />
                            <span className="text-stone-500 font-medium">günde bir</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-stone-700 font-semibold mb-1">Randevu Saati</label>
                        <input
                          type="time"
                          value={aptTime}
                          onChange={(e) => setAptTime(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold text-stone-900 focus:outline-none focus:border-[#B86B35]"
                        />
                      </div>
                    </div>

                    {/* KAÇ AYLIK SERİ? */}
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1.5">Kaç Aylık Seri Oluşturulsun?</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 3, 5, 6].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setDurationMonths(m);
                              setNewCustomOverrides({});
                            }}
                            className={`py-1.5 px-2 rounded-lg border font-bold text-center transition ${
                              durationMonths === m
                                ? 'bg-[#B86B35] text-white border-[#B86B35] shadow-2xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            {m} Aylık {m === 5 && '⭐'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ⭐ PAZAR GÜNÜ OTOMATİK AYARLAMA KURALI (BERBERİN GÖRECEĞİ YER) */}
                    <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          Pazar Günü Çözümü (Dükkan Kapalıysa):
                        </span>
                        <span className="text-[10px] text-amber-800 font-semibold bg-amber-100/90 border border-amber-200 px-2 py-0.5 rounded">
                          Otomatik Kaydırma
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-900">
                        Randevu Pazar gününe denk gelirse sistem otomatik olarak hangi güne kaydırsın?
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setSundayShift('prev_day');
                            setNewCustomOverrides({});
                          }}
                          className={`p-2 rounded-lg border text-center transition font-bold flex items-center justify-center gap-1 ${
                            sundayShift === 'prev_day'
                              ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                              : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100/60'
                          }`}
                        >
                          <span>⬅️ 1 Gün Önceye</span>
                          <span className="text-[10px] font-normal">(Cumartesi)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSundayShift('next_day');
                            setNewCustomOverrides({});
                          }}
                          className={`p-2 rounded-lg border text-center transition font-bold flex items-center justify-center gap-1 ${
                            sundayShift === 'next_day'
                              ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                              : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100/60'
                          }`}
                        >
                          <span>1 Gün Sonraya ➡️</span>
                          <span className="text-[10px] font-normal">(Pazartesi)</span>
                        </button>
                      </div>
                    </div>

                    {/* CANLI ÖNİZLEME LİSTESİ VE TEK TEK DEĞİŞTİRME */}
                    <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-900 border-b border-stone-100 pb-1.5">
                        <span>Oluşturulacak Sıralı Randevular ({previewDatesForNew.length}):</span>
                        <span className="text-[#B86B35] font-mono">{aptTime}</span>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {previewDatesForNew.map((d, index) => {
                          const isSundayOrShifted = d.isOriginalSunday;
                          return (
                            <div
                              key={d.id || index}
                              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] p-2 rounded-lg border transition ${
                                isSundayOrShifted
                                  ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                                  : 'bg-stone-50 border-stone-100 text-stone-800'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold">{index + 1}. Randevu: {d.formatted}</span>
                                {isSundayOrShifted && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 border border-amber-300">
                                    ⚠️ {d.shiftedTo === 'prev' ? 'Cumartesiye Alındı' : 'Pazartesiye Alındı'}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                {isSundayOrShifted && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => shiftNewRowDate(index, 'prev')}
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                                        d.shiftedTo === 'prev'
                                          ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                                          : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                                      }`}
                                      title="Bu randevuyu Cumartesiye çek"
                                    >
                                      Cmt Yap
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => shiftNewRowDate(index, 'next')}
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                                        d.shiftedTo === 'next'
                                          ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                                          : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                                      }`}
                                      title="Bu randevuyu Pazartesiye çek"
                                    >
                                      Pzt Yap
                                    </button>
                                  </div>
                                )}
                                <span className="text-stone-500 font-mono font-bold">{aptTime}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        ✓ Pazar günleri otomatik olarak kaydırılmıştır; berber istediği randevuyu tek tıkla Cumartesi veya Pazartesiye ayarlayabilir.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-stone-100 text-stone-700 font-semibold hover:bg-stone-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-[#B86B35] hover:bg-[#A35C2B] text-white font-bold transition shadow-xs"
                >
                  {isRecurringEnabled ? `Müşteriyi ve ${previewDatesForNew.length} Randevuyu Kaydet` : 'Müşteriyi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MEVCUT MÜŞTERİYE PERİYODİK RANDEVU SERİSİ MODALI */}
      {showRecurringModalForExisting && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  {selectedCustomer.name} için Periyodik Randevu Serisi
                </h3>
                <p className="text-xs text-stone-500">{selectedCustomer.phone} • Sıralı Randevu Oluşturucu</p>
              </div>
              <button onClick={() => setShowRecurringModalForExisting(false)} className="text-stone-400 hover:text-stone-700 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRecurringForExisting} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Usta / Personel</label>
                  <select
                    value={existingCustStaff}
                    onChange={(e) => setExistingCustStaff(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 font-semibold"
                  >
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>✂️ {st.name} ({st.title})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Hizmet</label>
                  <select
                    value={existingCustService}
                    onChange={(e) => setExistingCustService(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 font-semibold"
                  >
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.id}>{srv.name} (₺{srv.price})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DÖNGÜ MODELİ */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Döngü Modeli:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExistingRecurringType('monthly_day');
                      setExistingCustomOverrides({});
                    }}
                    className={`p-2.5 rounded-lg border text-left font-medium transition ${
                      existingRecurringType === 'monthly_day'
                        ? 'bg-white border-[#B86B35] text-[#B86B35] shadow-2xs font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    🗓️ Her Ayın Sabit Günü
                    <span className="block text-[10px] text-stone-500 font-normal">Örn: Her ayın 20&apos;sinde</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExistingRecurringType('interval_days');
                      setExistingCustomOverrides({});
                    }}
                    className={`p-2.5 rounded-lg border text-left font-medium transition ${
                      existingRecurringType === 'interval_days'
                        ? 'bg-white border-[#B86B35] text-[#B86B35] shadow-2xs font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    ⏱️ Periyodik Gün Aralığı
                    <span className="block text-[10px] text-stone-500 font-normal">Örn: Her 20 günde bir</span>
                  </button>
                </div>
              </div>

              {/* GÜN VE SAAT */}
              <div className="grid grid-cols-2 gap-2">
                {existingRecurringType === 'monthly_day' ? (
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Her Ayın Hangi Günü?</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-500 font-medium">Her ayın</span>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={existingMonthlyDay}
                        onChange={(e) => {
                          setExistingMonthlyDay(Number(e.target.value));
                          setExistingCustomOverrides({});
                        }}
                        className="w-16 bg-white border border-stone-300 rounded-lg px-2 py-1.5 text-center font-bold text-stone-900 focus:outline-none focus:border-[#B86B35]"
                      />
                      <span className="text-stone-500 font-medium">. günü</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Kaç Günde Bir?</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-500 font-medium">Her</span>
                      <input
                        type="number"
                        min={5}
                        max={90}
                        value={existingIntervalDays}
                        onChange={(e) => {
                          setExistingIntervalDays(Number(e.target.value));
                          setExistingCustomOverrides({});
                        }}
                        className="w-16 bg-white border border-stone-300 rounded-lg px-2 py-1.5 text-center font-bold text-stone-900 focus:outline-none focus:border-[#B86B35]"
                      />
                      <span className="text-stone-500 font-medium">günde bir</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Randevu Saati</label>
                  <input
                    type="time"
                    value={existingAptTime}
                    onChange={(e) => setExistingAptTime(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-bold text-stone-900 focus:outline-none focus:border-[#B86B35]"
                  />
                </div>
              </div>

              {/* KAÇ AYLIK SERİ? */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1.5">Kaç Aylık Seri Oluşturulsun?</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 3, 5, 6].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setExistingDurationMonths(m);
                        setExistingCustomOverrides({});
                      }}
                      className={`py-1.5 px-2 rounded-lg border font-bold text-center transition ${
                        existingDurationMonths === m
                          ? 'bg-[#B86B35] text-white border-[#B86B35] shadow-2xs'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {m} Aylık {m === 5 && '⭐'}
                    </button>
                  ))}
                </div>
              </div>

              {/* ⭐ PAZAR GÜNÜ AYARI */}
              <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Pazar Günü Çözümü (Dükkan Kapalıysa):
                  </span>
                  <span className="text-[10px] text-amber-800 font-semibold bg-amber-100/90 border border-amber-200 px-2 py-0.5 rounded">
                    Otomatik Kaydırma
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setExistingSundayShift('prev_day');
                      setExistingCustomOverrides({});
                    }}
                    className={`p-2 rounded-lg border text-center transition font-bold flex items-center justify-center gap-1 ${
                      existingSundayShift === 'prev_day'
                        ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                        : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100/60'
                    }`}
                  >
                    <span>⬅️ 1 Gün Önceye</span>
                    <span className="text-[10px] font-normal">(Cumartesi)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExistingSundayShift('next_day');
                      setExistingCustomOverrides({});
                    }}
                    className={`p-2 rounded-lg border text-center transition font-bold flex items-center justify-center gap-1 ${
                      existingSundayShift === 'next_day'
                        ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                        : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100/60'
                    }`}
                  >
                    <span>1 Gün Sonraya ➡️</span>
                    <span className="text-[10px] font-normal">(Pazartesi)</span>
                  </button>
                </div>
              </div>

              {/* CANLI ÖNİZLEME LİSTESİ */}
              <div className="bg-[#FAF3EE] border border-[#B86B35]/30 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-900 border-b border-[#B86B35]/20 pb-1.5">
                  <span>Oluşturulacak Sıralı Randevular ({previewDatesForExisting.length}):</span>
                  <span className="text-[#B86B35] font-mono">{existingAptTime}</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {previewDatesForExisting.map((d, index) => {
                    const isSundayOrShifted = d.isOriginalSunday;
                    return (
                      <div
                        key={d.id || index}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] p-2 rounded-lg border transition ${
                          isSundayOrShifted
                            ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                            : 'bg-white border-stone-200 text-stone-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold">{index + 1}. Randevu: {d.formatted}</span>
                          {isSundayOrShifted && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 border border-amber-300">
                              ⚠️ {d.shiftedTo === 'prev' ? 'Cumartesiye Alındı' : 'Pazartesiye Alındı'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {isSundayOrShifted && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => shiftExistingRowDate(index, 'prev')}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                                  d.shiftedTo === 'prev'
                                    ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                                    : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                                }`}
                                title="Bu randevuyu Cumartesiye çek"
                              >
                                Cmt Yap
                              </button>
                              <button
                                type="button"
                                onClick={() => shiftExistingRowDate(index, 'next')}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                                  d.shiftedTo === 'next'
                                    ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                                    : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                                }`}
                                title="Bu randevuyu Pazartesiye çek"
                              >
                                Pzt Yap
                              </button>
                            </div>
                          )}
                          <span className="text-stone-500 font-mono font-bold">{existingAptTime}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecurringModalForExisting(false)}
                  className="flex-1 py-2.5 rounded-lg bg-stone-100 text-stone-700 font-semibold hover:bg-stone-200 transition"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-[#B86B35] hover:bg-[#A35C2B] text-white font-bold transition shadow-xs"
                >
                  {previewDatesForExisting.length} Randevuyu Takvime İşle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
