'use client';

import React, { useState, useEffect } from 'react';
import { Salon, Staff, Service, Appointment, TimeSlot, AuthUser, WorkingHours, CustomerProfile } from '@/types';
import { initialWorkingHours, calculateAvailableSlots } from '@/lib/dataStore';
import { CalendarPicker } from '@/components/CalendarPicker';
import { CustomerAppointmentsView } from '@/components/CustomerAppointmentsView';
import {
  Scissors,
  Clock,
  User,
  Phone,
  CheckCircle2,
  Calendar as CalendarIcon,
  MapPin,
  ArrowRight,
  Repeat,
  Sparkles,
  ShieldCheck,
  LayoutGrid,
  LogOut,
  Check,
  CalendarDays,
  UserCheck,
} from 'lucide-react';

// Periyodik Randevu Tarihleri Üretici Fonksiyonu (Pazar Günü Otomatik Kaydırmalı)
function generateRecurringDates(
  type: 'monthly_day' | 'interval_days',
  dayOrInterval: number,
  months: number,
  sundayShift: 'prev_day' | 'next_day' = 'next_day',
  baseDateStr?: string
): { dateStr: string; formatted: string; isSunday: boolean }[] {
  const dates: { dateStr: string; formatted: string; isSunday: boolean }[] = [];
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
      if (isSunday) {
        if (sundayShift === 'prev_day') {
          d.setDate(d.getDate() - 1); // Cumartesi
        } else {
          d.setDate(d.getDate() + 1); // Pazartesi
        }
      }

      const dateStr = d.toISOString().split('T')[0];
      const formatted = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' });
      dates.push({ dateStr, formatted, isSunday });
    }
  } else {
    const interval = Math.max(1, dayOrInterval);
    const totalDays = months * 30;
    let curr = new Date(start);

    while (dates.length < Math.max(months, Math.floor(totalDays / interval))) {
      const d = new Date(curr);
      const isSunday = d.getDay() === 0;
      if (isSunday) {
        if (sundayShift === 'prev_day') {
          d.setDate(d.getDate() - 1); // Cumartesi
        } else {
          d.setDate(d.getDate() + 1); // Pazartesi
        }
      }

      const dateStr = d.toISOString().split('T')[0];
      const formatted = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' });
      dates.push({ dateStr, formatted, isSunday });
      curr = new Date(curr.getTime() + interval * 24 * 60 * 60 * 1000);
      if (dates.length >= 24) break;
    }
  }

  return dates;
}

interface CustomerBookingProps {
  currentUser: AuthUser;
  salon: Salon;
  staffList: Staff[];
  services: Service[];
  appointments: Appointment[];
  customers?: CustomerProfile[];
  workingHours?: WorkingHours[];
  onBookAppointment: (newApt: Omit<Appointment, 'id' | 'createdAt'>) => void;
  onAddBatchAppointments?: (appointments: Omit<Appointment, 'id' | 'createdAt'>[]) => void;
  onCancelAppointment: (aptId: string) => void;
  onLogout?: () => void;
}

export const CustomerBooking: React.FC<CustomerBookingProps> = ({
  currentUser,
  salon,
  staffList,
  services,
  appointments,
  customers = [],
  workingHours = initialWorkingHours,
  onBookAppointment,
  onAddBatchAppointments,
  onCancelAppointment,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'book' | 'my-appointments' | 'profile'>('book');

  // Müşteriye berber tarafından daha önce atanmış bir personel var mı?
  const matchingCustomerProfile = customers.find(
    (c) =>
      c.name.toLowerCase() === currentUser.name.toLowerCase() ||
      (currentUser.phone && c.phone.replace(/\s+/g, '') === currentUser.phone.replace(/\s+/g, '')) ||
      (currentUser.email && c.name.toLowerCase().includes(currentUser.email.split('@')[0].toLowerCase()))
  );

  const assignedStaffFromSalon = matchingCustomerProfile?.favoriteStaff
    ? staffList.find(
        (s) =>
          s.name.toLowerCase() === matchingCustomerProfile.favoriteStaff?.toLowerCase() ||
          s.id === matchingCustomerProfile.assignedStaffId
      )
    : null;

  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    assignedStaffFromSalon?.id || staffList[0]?.id || ''
  );

  useEffect(() => {
    if (assignedStaffFromSalon?.id) {
      setSelectedStaffId(assignedStaffFromSalon.id);
    }
  }, [assignedStaffFromSalon?.id]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [selectedDate, setSelectedDate] = useState<string>(tomorrow.toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showFullCalendar, setShowFullCalendar] = useState<boolean>(false);

  // Not
  const [notes, setNotes] = useState<string>('');

  // 🔄 OTOMATİK PERİYODİK TIRAŞ DÖNGÜSÜ
  const [isRecurringEnabled, setIsRecurringEnabled] = useState<boolean>(false);
  const [recurringType, setRecurringType] = useState<'monthly_day' | 'interval_days'>('monthly_day');
  const [recurringDays, setRecurringDays] = useState<number>(20); // Varsayılan 20 gün
  const [recurringMonths, setRecurringMonths] = useState<number>(5); // 5 Aylık Seri (Örn: Her ayın 20'si)
  const [sundayShift, setSundayShift] = useState<'prev_day' | 'next_day'>('next_day'); // Pazar günü Cumartesi mi Pazartesi mi

  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string>('');

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const selectedStaff = staffList.find((s) => s.id === selectedStaffId) || staffList[0];

  const dayCards = [0, 1, 2, 3].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dateStr = d.toISOString().split('T')[0];
    const dayNum = d.getDate();
    const dayName = offset === 0 ? 'Bugün' : d.toLocaleDateString('tr-TR', { weekday: 'short' });
    return { dateStr, dayNum, dayName };
  });

  // Müşterinin kendi randevuları (Tüm salon randevuları DEĞİL)
  const userAppointments = appointments.filter(
    (a) =>
      a.customerName.toLowerCase() === currentUser.name.toLowerCase() ||
      (currentUser.phone && a.customerPhone.replace(/\s+/g, '') === currentUser.phone.replace(/\s+/g, '')) ||
      (currentUser.email && a.customerName.toLowerCase().includes(currentUser.email.split('@')[0].toLowerCase())) ||
      (currentUser.name.toLowerCase().includes('salih') && a.customerName.toLowerCase().includes('salih')) ||
      (currentUser.name.toLowerCase().includes('can') && a.customerName.toLowerCase().includes('can'))
  );

  const selectedDayOfWeek = new Date(selectedDate).getDay();
  const selectedDayWh = workingHours.find((w) => w.dayOfWeek === selectedDayOfWeek) || {
    id: `wh-${selectedDayOfWeek}`,
    salonId: salon.id,
    dayOfWeek: selectedDayOfWeek,
    startTime: '08:00',
    endTime: '21:00',
    breakStart: '13:00',
    breakEnd: '14:00',
    isClosed: false,
  };

  const isStaffOff = selectedStaff && (
    (selectedStaff.weeklyOffDays && selectedStaff.weeklyOffDays.includes(selectedDayOfWeek)) ||
    (selectedStaff.leaveDates && selectedStaff.leaveDates.includes(selectedDate))
  );

  const availableSlots: TimeSlot[] = selectedStaff && selectedDate && selectedService
    ? calculateAvailableSlots(
        selectedStaff.id,
        selectedDate,
        selectedService.durationMinutes,
        appointments,
        workingHours,
        staffList
      )
    : [];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) {
      alert('Lütfen randevu saatini seçin.');
      return;
    }

    const duration = selectedService.durationMinutes;
    const [h, m] = selectedTime.split(':').map(Number);
    const totalMin = h * 60 + m + duration;
    const endH = String(Math.floor(totalMin / 60)).padStart(2, '0');
    const endM = String(totalMin % 60).padStart(2, '0');

    // Eğer kullanıcı periyodik randevu serisi seçtiyse ve 1'den fazla ay istendiyse
    if (isRecurringEnabled && recurringMonths > 1 && onAddBatchAppointments) {
      const selectedDayOfMonth = new Date(selectedDate).getDate();
      const generatedDates = generateRecurringDates(
        recurringType,
        recurringType === 'monthly_day' ? selectedDayOfMonth : recurringDays,
        recurringMonths,
        sundayShift,
        selectedDate
      );

      const batch = generatedDates.map((d, idx) => ({
        salonId: salon.id,
        staffId: selectedStaff.id,
        staffName: selectedStaff.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        customerName: currentUser.name,
        customerPhone: currentUser.phone || '0544 222 33 44',
        appointmentDate: d.dateStr,
        startTime: selectedTime,
        endTime: `${endH}:${endM}`,
        price: selectedService.price,
        status: salon.autoConfirm ? ('confirmed' as const) : ('pending' as const),
        notes: `VIP Periyodik Randevu Serisi (${idx + 1}/${generatedDates.length})${notes ? ` • ${notes}` : ''}`,
        recurringDays: recurringType === 'interval_days' ? recurringDays : 30,
      }));

      onAddBatchAppointments(batch);
      setBookingSuccessMsg(
        `Sayın ${currentUser.name}, toplam ${batch.length} randevunuz (${recurringMonths} aylık sıralı seri halinde) başarıyla oluşturuldu ve berber ajandasına işlendi!`
      );
    } else {
      onBookAppointment({
        salonId: salon.id,
        staffId: selectedStaff.id,
        staffName: selectedStaff.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        customerName: currentUser.name,
        customerPhone: currentUser.phone || '0544 222 33 44',
        appointmentDate: selectedDate,
        startTime: selectedTime,
        endTime: `${endH}:${endM}`,
        price: selectedService.price,
        status: salon.autoConfirm ? 'confirmed' : 'pending',
        notes,
        recurringDays: isRecurringEnabled ? recurringDays : undefined,
      });
      setBookingSuccessMsg(
        `Sayın ${currentUser.name}, randevunuz sisteme işlendi. Randevu saatiniz yaklaşınca bildirim gelecektir.`
      );
    }

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedTime('');
    }, 6000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-36">
      {/* 1. ÜST BAŞLIK VE SEKME */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-stone-500 font-medium">Online randevu · {salon.district || 'Kadıköy'}</span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-0.5">
            {salon.name}
          </h1>
        </div>

        <div className="flex bg-stone-200/60 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'book'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Randevu Al
          </button>
          <button
            onClick={() => setActiveTab('my-appointments')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'my-appointments'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Randevularım ({userAppointments.length})
          </button>
        </div>
      </div>

      {bookingSuccess && (
        <div className="bg-[#E7F6EC] border border-emerald-300 rounded-3xl p-5 text-emerald-900 space-y-1 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h4 className="font-bold text-sm">Randevunuz Başarıyla Alındı!</h4>
          </div>
          <p className="text-xs text-emerald-800 pl-7 leading-relaxed">
            {bookingSuccessMsg || `Sayın ${currentUser.name}, randevunuz sisteme işlendi. Randevu saatiniz yaklaşınca bildirim gelecektir.`}
          </p>
        </div>
      )}

      {/* 1. SEÇENEK: RANDEVU ALMA AKIŞI (TAM ÖZGÜR SEÇİM) */}
      {activeTab === 'book' && (
        <form onSubmit={handleBookingSubmit} className="space-y-6">
          
          {/* ADIM 1: HİZMET SEÇİMİ (AÇIK VE ŞIK KARTLAR) */}
          <div className="bg-white border border-[#EBE7DF] rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#B86B35] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold text-stone-900">Hizmet Seçimi</h3>
              </div>
              <span className="text-xs text-stone-400">İstediğiniz işlemi seçin</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((srv) => {
                const isSelected = selectedServiceId === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#B86B35] bg-[#FAF3EE] ring-1 ring-[#B86B35] shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-stone-900 leading-snug">{srv.name}</span>
                        <span className="text-sm font-black text-[#B86B35] shrink-0">₺{srv.price}</span>
                      </div>
                      {srv.description && (
                        <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                          {srv.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-stone-100/80 text-[11px]">
                      <span className="text-stone-500 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" /> {srv.durationMinutes} dakika
                      </span>
                      {isSelected ? (
                        <span className="text-[#B86B35] font-bold flex items-center gap-1 text-[11px]">
                          <Check className="w-3.5 h-3.5" /> Seçildi
                        </span>
                      ) : (
                        <span className="text-stone-400 hover:text-stone-700">Seç</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ADIM 2: PERSONEL / USTA SEÇİMİ (KENDİLERİ SEÇSİN VEYA ATANAN GELSİN) */}
          <div className="bg-white border border-[#EBE7DF] rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#B86B35] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-bold text-stone-900">Personel / Usta Seçimi</h3>
              </div>
              <span className="text-xs text-stone-400">İstediğiniz berberi belirleyin</span>
            </div>

            {/* EĞER BERBER REHBERDE BU MÜŞTERİYE BİR USTA ATAMIŞSA BİLGİLENDİRME */}
            {assignedStaffFromSalon && (
              <div className="bg-[#FAF3EE] border border-[#B86B35]/30 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#B86B35] text-white font-black text-xs flex items-center justify-center shrink-0">
                  ⭐
                </div>
                <div className="text-xs flex-1">
                  <span className="font-bold text-stone-900">Berberiniz Size Özel Usta Atadı:</span>{' '}
                  <strong className="text-[#B86B35]">{assignedStaffFromSalon.name}</strong> ({assignedStaffFromSalon.title}).
                  <span className="text-stone-500 block text-[11px] mt-0.5">
                    Dilerseniz aşağıdaki diğer ustalardan birini de özgürce seçebilirsiniz.
                  </span>
                </div>
              </div>
            )}

            {/* USTA KARTLARI LİSTESİ */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {staffList.map((st) => {
                const isSelected = selectedStaffId === st.id;
                const isAssigned = assignedStaffFromSalon?.id === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => {
                      setSelectedStaffId(st.id);
                      setSelectedTime(''); // Usta değişince saat sıfırlansın
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all text-center flex flex-col items-center justify-between relative ${
                      isSelected
                        ? 'border-[#B86B35] bg-[#FAF3EE] ring-1 ring-[#B86B35] shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    {isAssigned && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#B86B35] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-2xs whitespace-nowrap">
                        ⭐ Atanan Ustanız
                      </span>
                    )}
                    <div
                      className={`w-12 h-12 rounded-full font-bold flex items-center justify-center text-sm mb-2 transition-colors ${
                        isSelected ? 'bg-[#B86B35] text-white' : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {st.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 text-xs leading-snug">{st.name}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{st.title}</div>
                    </div>
                    {isSelected ? (
                      <div className="mt-2.5 text-[10px] font-bold text-[#B86B35] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Seçili Usta
                      </div>
                    ) : (
                      <div className="mt-2.5 text-[10px] text-stone-400">
                        Koltuk Seç
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ADIM 3: TARİH VE SAAT BÖLÜMÜ */}
          <div className="bg-white border border-[#EBE7DF] rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#B86B35] text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-bold text-stone-900">Tarih ve Saat Seçimi</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFullCalendar(!showFullCalendar)}
                className="text-xs text-[#B86B35] font-bold hover:underline flex items-center gap-1"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                {showFullCalendar ? 'Hızlı Günleri Göster' : 'Farklı Tarih Seç'}
              </button>
            </div>

            {/* İNTERAKTİF TAM TAKVİM SEÇİCİ (İSTENİRSE AÇILIR) */}
            {showFullCalendar ? (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <CalendarPicker
                  selectedDate={selectedDate}
                  onSelectDate={(date) => {
                    setSelectedDate(date);
                    setSelectedTime('');
                    setShowFullCalendar(false);
                  }}
                />
              </div>
            ) : (
              /* 4 GÜN YATAY KARTLARI (Bugün, Yarın vb.) */
              <div className="grid grid-cols-4 gap-2">
                {dayCards.map((dc) => {
                  const isSelected = selectedDate === dc.dateStr;
                  return (
                    <button
                      key={dc.dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(dc.dateStr);
                        setSelectedTime('');
                      }}
                      className={`py-3 px-2 rounded-xl text-center border transition ${
                        isSelected
                          ? 'bg-[#B86B35] text-white border-[#B86B35] shadow-xs font-bold'
                          : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100 font-medium'
                      }`}
                    >
                      <div className="text-xs">{dc.dayName}</div>
                      <div className="text-base font-extrabold mt-0.5">{dc.dayNum}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* SAAT SLOTLARI (Seçilen Ustanın Müsait Saatleri) */}
            <div>
              <div className="flex items-center justify-between text-xs text-stone-600 mb-2.5 font-medium">
                <span><strong>{selectedStaff.name}</strong> için randevu saatleri:</span>
                <span className="font-mono text-stone-400">
                  {availableSlots.filter((s) => s.available).length} boş koltuk
                </span>
              </div>

              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    return (
                      <button
                        type="button"
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2.5 px-2 text-center rounded-xl text-xs font-mono font-bold transition border ${
                          !slot.available
                            ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-[#B86B35] text-white border-[#B86B35] shadow-sm ring-1 ring-[#B86B35]'
                            : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 px-4 rounded-xl border border-dashed border-stone-200 text-center text-xs text-stone-500">
                  {isStaffOff ? (
                    <span className="text-amber-800 font-semibold">
                      ⚠️ {selectedStaff.name} bu tarihte izinlidir. Lütfen başka bir gün veya usta seçiniz.
                    </span>
                  ) : selectedDayWh.isClosed ? (
                    <span className="text-stone-600 font-semibold">🔒 Salonumuz bu gün kapalıdır.</span>
                  ) : (
                    <span>Bu tarihte {selectedStaff.name} için tüm randevu saatleri doludur.</span>
                  )}
                </div>
              )}
            </div>

            {/* 🔄 AKILLI PERİYODİK TIRAŞ DÖNGÜSÜ */}
            <div className="bg-[#FAF3EE] border border-[#B86B35]/30 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#B86B35] text-white flex items-center justify-center font-bold">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-900 text-xs">Otomatik Sıralı Randevu Serisi Oluştur</div>
                    <div className="text-[11px] text-stone-500">
                      Örn: Her ayın 20&apos;sinde veya 20 günde bir 5 ay boyunca otomatik oluşsun
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRecurringEnabled(!isRecurringEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    isRecurringEnabled ? 'bg-[#B86B35]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isRecurringEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {isRecurringEnabled && (
                <div className="pt-2 border-t border-[#B86B35]/20 space-y-2.5 text-xs animate-in fade-in">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Döngü Modeli:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRecurringType('monthly_day')}
                        className={`p-2 rounded-lg border text-left font-medium transition ${
                          recurringType === 'monthly_day'
                            ? 'bg-white border-[#B86B35] text-[#B86B35] shadow-2xs font-bold'
                            : 'bg-stone-50 border-stone-200 text-stone-700'
                        }`}
                      >
                        🗓️ Her Ayın Sabit Günü
                        <span className="block text-[10px] text-stone-500 font-normal">
                          Her ayın {new Date(selectedDate).getDate()}&apos;si saat {selectedTime || '--:--'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecurringType('interval_days')}
                        className={`p-2 rounded-lg border text-left font-medium transition ${
                          recurringType === 'interval_days'
                            ? 'bg-white border-[#B86B35] text-[#B86B35] shadow-2xs font-bold'
                            : 'bg-stone-50 border-stone-200 text-stone-700'
                        }`}
                      >
                        ⏱️ Periyodik Gün Aralığı
                        <span className="block text-[10px] text-stone-500 font-normal">
                          Her 20 günde bir saat {selectedTime || '--:--'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Kaç Aylık Seri Oluşturulsun?</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 3, 5, 6].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setRecurringMonths(m)}
                          className={`py-1.5 px-2 rounded-lg border font-bold text-center transition ${
                            recurringMonths === m
                              ? 'bg-[#B86B35] text-white border-[#B86B35] shadow-2xs'
                              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          {m} Aylık {m === 5 && '⭐'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PAZAR GÜNÜ AYARI */}
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Pazar Günü Çözümü (Dükkan Kapalıysa):</label>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSundayShift('prev_day')}
                        className={`p-1.5 rounded-lg border text-center transition font-bold ${
                          sundayShift === 'prev_day'
                            ? 'bg-[#B86B35] text-white border-[#B86B35] shadow-2xs'
                            : 'bg-white border-stone-200 text-stone-700'
                        }`}
                      >
                        ⬅️ Cumartesiye Al
                      </button>
                      <button
                        type="button"
                        onClick={() => setSundayShift('next_day')}
                        className={`p-1.5 rounded-lg border text-center transition font-bold ${
                          sundayShift === 'next_day'
                            ? 'bg-[#B86B35] text-white border-[#B86B35] shadow-2xs'
                            : 'bg-white border-stone-200 text-stone-700'
                        }`}
                      >
                        Pazartesiye Al ➡️
                      </button>
                    </div>
                  </div>

                  {recurringMonths > 1 && (
                    <div className="p-2.5 rounded-lg bg-white border border-stone-200 text-[11px] text-stone-700 flex items-center justify-between">
                      <span>⚡ Randevu onaylandığında:</span>
                      <strong className="text-[#B86B35]">
                        {recurringMonths} adet sıralı randevu takvime işlenecektir
                      </strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* OPSİYONEL BERBERE NOT */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1 text-xs">Ustanıza Not (Opsiyonel)</label>
              <input
                type="text"
                placeholder="Örn: Yanlar 2 numara, favoriler uzun kalsın..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-[#B86B35]"
              />
            </div>
          </div>

          {/* SABİT ALT CHECKOUT ÇUBUĞU (STICKY BAR) */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#EBE7DF] p-3 sm:p-4 shadow-lg z-30">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-stone-500 font-medium truncate max-w-[200px] sm:max-w-none">
                  {selectedService.name} · <strong className="text-stone-800">{selectedStaff.name}</strong>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs bg-stone-100 text-stone-700 font-mono px-2 py-0.5 rounded font-bold">
                    {selectedDate} {selectedTime || '--:--'}
                  </span>
                  <span className="text-xl font-black text-stone-900 tracking-tight">
                    ₺{selectedService.price}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedTime}
                className="bg-[#B86B35] hover:bg-[#A35C2B] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-xs flex items-center gap-2 shrink-0"
              >
                <span>{selectedTime ? 'Randevuyu Onayla' : 'Saat Seçiniz'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 2. SEÇENEK: RANDEVULARIM */}
      {activeTab === 'my-appointments' && (
        <CustomerAppointmentsView
          currentUser={currentUser}
          appointments={appointments}
          onCancelAppointment={onCancelAppointment}
        />
      )}

      {/* 3. SEÇENEK: MÜŞTERİ PROFİLİ */}
      {activeTab === 'profile' && (
        <div className="max-w-md mx-auto space-y-4">
          <div className="bg-[#151b26] text-white px-5 py-5 rounded-3xl shadow-sm text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-white/10 text-amber-400 font-extrabold text-xl flex items-center justify-center mx-auto">
              {currentUser.name.charAt(0)}
            </div>
            <h2 className="text-base font-bold tracking-tight">{currentUser.name}</h2>
            <p className="text-xs text-slate-400">{currentUser.phone || currentUser.email}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tercihler</h3>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900">Otomatik Tıraş Döngüsü</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Her {recurringDays} günde 1 hatırlat</div>
              </div>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                Aktif
              </span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center justify-center gap-2 border border-rose-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Hesaptan Çıkış Yap</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
