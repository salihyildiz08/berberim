'use client';

import React, { useState } from 'react';
import { Salon, Staff, Service, Appointment, TimeSlot, AuthUser, WorkingHours } from '@/types';
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
} from 'lucide-react';

interface CustomerBookingProps {
  currentUser: AuthUser;
  salon: Salon;
  staffList: Staff[];
  services: Service[];
  appointments: Appointment[];
  workingHours?: WorkingHours[];
  onBookAppointment: (newApt: Omit<Appointment, 'id' | 'createdAt'>) => void;
  onCancelAppointment: (aptId: string) => void;
  onLogout?: () => void;
}

export const CustomerBooking: React.FC<CustomerBookingProps> = ({
  currentUser,
  salon,
  staffList,
  services,
  appointments,
  workingHours = initialWorkingHours,
  onBookAppointment,
  onCancelAppointment,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'book' | 'my-appointments' | 'profile'>('book');

  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffList[0]?.id || '');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [selectedDate, setSelectedDate] = useState<string>(tomorrow.toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Not
  const [notes, setNotes] = useState<string>('');

  // 🔄 OTOMATİK PERİYODİK TIRAŞ DÖNGÜSÜ (Örn: Her 20 Günde 1 Tıraş)
  const [isRecurringEnabled, setIsRecurringEnabled] = useState<boolean>(true);
  const [recurringDays, setRecurringDays] = useState<number>(20); // Varsayılan 20 gün

  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [nextAutoDateStr, setNextAutoDateStr] = useState<string>('');
  const [showServiceModal, setShowServiceModal] = useState<boolean>(false);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const selectedStaff = staffList.find((s) => s.id === selectedStaffId) || staffList[0];
  const otherStaff = staffList.filter((s) => s.id !== selectedStaff?.id);

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

  const earliestSlot = availableSlots.find((s) => s.available);

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

    // Otomatik sonraki randevu tarihi hesaplama
    if (isRecurringEnabled) {
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + recurringDays);
      setNextAutoDateStr(nextDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }));
    }

    onBookAppointment({
      salonId: salon.id,
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      // Giriş yapan müşterinin bilgisi otomatik kullanılıyor (Asla tekrar bilgi istemiyoruz!)
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

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedTime('');
    }, 5000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-32">
      {/* 1. ÜST BAŞLIK VE SEKME (SAYFA 3 BİREBİR) */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-stone-500 font-medium">Online randevu · {salon.district || 'Suadiye'}</span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-0.5">
            {salon.name}
          </h1>
        </div>

        <div className="flex bg-stone-200/60 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'book'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Randevu Al
          </button>
          <button
            onClick={() => setActiveTab('my-appointments')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
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
          <p className="text-xs text-emerald-800 pl-7">
            Sayın <strong>{currentUser.name}</strong>, randevunuz sisteme işlendi. Randevu saatiniz yaklaşınca bildirim gelecektir.
          </p>
        </div>
      )}

      {/* 1. SEÇENEK: RANDEVU ALMA AKIŞI (SAYFA 3 BİREBİR) */}
      {activeTab === 'book' && (
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          {/* 1. SEÇİLİ HİZMET KARTI (SAYFA 3 MOCKUP) */}
          <div className="bg-white border border-[#EBE7DF] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="bg-[#E7F6EC] text-[#1B6E37] text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                  1 Hizmet
                </span>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    {selectedService.name} - ₺{selectedService.price}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {selectedService.durationMinutes} dk · {selectedStaff.name} ({selectedStaff.title.toLowerCase()})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowServiceModal(!showServiceModal)}
                className="text-xs font-bold text-[#B86B35] hover:text-[#A35C2B] border border-[#B86B35]/30 hover:border-[#B86B35] px-3 py-1.5 rounded-xl transition"
              >
                {showServiceModal ? 'Kapat' : 'Değiştir'}
              </button>
            </div>

            {/* Hizmet Değiştirme Paneli (Açılırsa) */}
            {showServiceModal && (
              <div className="mt-4 pt-4 border-t border-stone-100 space-y-2 animate-in fade-in">
                <div className="text-xs font-bold text-stone-700 mb-2">Hizmet Seçin:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {services.map((srv) => (
                    <button
                      type="button"
                      key={srv.id}
                      onClick={() => {
                        setSelectedServiceId(srv.id);
                        setShowServiceModal(false);
                      }}
                      className={`text-left p-3 rounded-xl border transition ${
                        selectedServiceId === srv.id
                          ? 'border-[#B86B35] bg-[#FAF3EE]'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-stone-900">{srv.name}</span>
                        <span className="text-[#B86B35]">₺{srv.price}</span>
                      </div>
                      <span className="text-[11px] text-stone-500">{srv.durationMinutes} dakika</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. EN YAKIN MÜSAİT BANNERI (SAYFA 3 MOCKUP - #B86B35 KARAMEL BANNER) */}
          {earliestSlot && (
            <div className="bg-[#B86B35] text-white rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />
                <span className="text-xs font-medium">
                  En yakın müsait: <strong className="font-bold underline decoration-amber-200/50">Bugün {earliestSlot.time}</strong> · {selectedStaff.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(new Date().toISOString().split('T')[0]);
                  setSelectedTime(earliestSlot.time);
                }}
                className="bg-white text-[#B86B35] hover:bg-stone-50 font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition shrink-0"
              >
                Seç
              </button>
            </div>
          )}

          {/* 3. TARİH VE SAAT BÖLÜMÜ (SAYFA 3 MOCKUP) */}
          <div className="bg-white border border-[#EBE7DF] rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">3 Tarih ve saat</h3>
              <span className="text-xs text-stone-400 font-medium">Canlı koltuk takvimi</span>
            </div>

            {/* 4 GÜN YATAY KARTLARI (Bugün 6, Cmt 7, Paz 8, Pzt 9...) */}
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

            {/* SAAT SLOTLARI (6-Slot Grid) */}
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2.5 font-medium">
                <span>{selectedStaff.name} için müsait saatler</span>
                <span className="font-mono text-stone-400">{availableSlots.filter(s => s.available).length} boş slot</span>
              </div>

              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {availableSlots.slice(0, 12).map((slot) => {
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
                            ? 'bg-[#B86B35] text-white border-[#B86B35] shadow-sm'
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
                  Bu tarihte müsait saat bulunmamaktadır.
                </div>
              )}
            </div>

            {/* USTA DEĞİŞTİR LİNKİ (SAYFA 3 MOCKUP) */}
            <div className="pt-2 text-xs text-stone-500 border-t border-stone-100 flex items-center flex-wrap gap-1.5">
              <span>Usta değiştir:</span>
              {otherStaff.map((st, idx) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStaffId(st.id)}
                  className="font-bold text-[#B86B35] hover:underline"
                >
                  {st.name}{idx < otherStaff.length - 1 ? ',' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* SABİT ALT CHECKOUT ÇUBUĞU (SAYFA 3 MOCKUP - STICKY BAR) */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#EBE7DF] p-3 sm:p-4 shadow-lg z-30">
            <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-stone-500 font-medium">
                  {selectedDate === new Date().toISOString().split('T')[0] ? 'Bugün' : selectedDate} {selectedTime || '--:--'} · {selectedStaff.name}
                </div>
                <div className="text-xl font-black text-stone-900 tracking-tight">
                  ₺{selectedService.price}
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedTime}
                className="bg-[#B86B35] hover:bg-[#A35C2B] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-xs flex items-center gap-2"
              >
                <span>Randevuyu onayla</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 2. SEÇENEK: RANDEVULARIM (REFERANS GÖRSEL 3 STANDARDI) */}
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

      {/* 📱 MOBİL SABİT ALT NAVİGASYON BARI (REFERANS GÖRSEL 3 STANDARDI) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2.5 px-6 flex md:hidden items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('book')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
            activeTab === 'book' ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span>Panel</span>
        </button>

        <button
          onClick={() => setActiveTab('my-appointments')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
            activeTab === 'my-appointments' ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span>Randevular</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
            activeTab === 'profile' ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profil</span>
        </button>
      </div>
    </div>
  );
};
