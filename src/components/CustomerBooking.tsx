'use client';

import React, { useState } from 'react';
import { Salon, Staff, Service, Appointment, TimeSlot, AuthUser } from '@/types';
import { calculateAvailableSlots } from '@/lib/dataStore';
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

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const selectedStaff = staffList.find((s) => s.id === selectedStaffId) || staffList[0];

  const availableSlots: TimeSlot[] = selectedStaff && selectedDate && selectedService
    ? calculateAvailableSlots(
        selectedStaff.id,
        selectedDate,
        selectedService.durationMinutes,
        appointments,
        [
          { id: '1', salonId: salon.id, dayOfWeek: new Date(selectedDate).getDay(), startTime: '09:00', endTime: '21:00', breakStart: '13:00', breakEnd: '14:00', isClosed: false }
        ]
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
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-6">
      {/* SALON AYDINLIK HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/60">
                Online Randevu
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {salon.address}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {salon.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              İletişim: {salon.phone} • Çalışma Saatleri: 09:00 - 21:00
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl self-stretch sm:self-auto">
            <button
              onClick={() => setActiveTab('book')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'book'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Randevu Al
            </button>
            <button
              onClick={() => setActiveTab('my-appointments')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'my-appointments'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Randevularım ({appointments.length})
            </button>
          </div>
        </div>
      </div>

      {bookingSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-emerald-900 space-y-1 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h4 className="font-bold text-sm">Randevunuz Başarıyla Alındı!</h4>
          </div>
          <p className="text-xs text-emerald-800 pl-7">
            Sayın <strong>{currentUser.name}</strong>, randevunuz sisteme işlendi. Randevu saatiniz yaklaşınca kilit ekranınıza bildirim gelecektir.
          </p>
          {isRecurringEnabled && nextAutoDateStr && (
            <div className="mt-2 pl-7 text-xs bg-white/80 p-3 rounded-xl border border-emerald-200 text-emerald-950 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Akıllı Döngü Devrede:</strong> Her <strong>{recurringDays} günde bir</strong> otomatik randevu oluşturulacak. Bir sonraki tahmini randevunuz: <strong>{nextAutoDateStr} saat {selectedTime}</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* 1. SEÇENEK: RANDEVU ALMA AKIŞI */}
      {activeTab === 'book' && (
        <form onSubmit={handleBookingSubmit} className="space-y-6">
          {/* 1. HİZMET MENÜSÜ */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-xs font-bold text-white flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold text-slate-900">Hizmet Seçimi</h3>
              </div>
              <span className="text-[11px] text-slate-400">İşlem süresi koltuğu bloke eder</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((srv) => {
                const isSelected = selectedServiceId === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{srv.name}</h4>
                        <span className="text-xs font-bold text-slate-900 shrink-0">
                          {srv.price > 0 ? `${srv.price} TL` : 'Fiyatsız'}
                        </span>
                      </div>
                      {srv.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {srv.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{srv.durationMinutes} Dakika</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. STİLİST SEÇİMİ */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-xs font-bold text-white flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-bold text-slate-900">Berber / Stilist</h3>
              </div>
              <span className="text-[11px] text-slate-400">Tercih ettiğiniz usta</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {staffList.map((st) => {
                const isSelected = selectedStaffId === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStaffId(st.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all text-center flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full font-bold flex items-center justify-center text-sm mb-2 transition-colors ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {st.name.charAt(0)}
                    </div>
                    <div className="font-bold text-slate-900 text-xs leading-snug">{st.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{st.title}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. İNTERAKTİF TAKVİM & SAAT SEÇİMİ */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-xs font-bold text-white flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-bold text-slate-900">Tarih & Saat Seçimi</h3>
              </div>
              <span className="text-[11px] text-slate-400">Canlı Koltuk Durumu</span>
            </div>

            {/* İnteraktif Takvim Seçici */}
            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-xs">
                Randevu Tarihini Seçin
              </label>
              <CalendarPicker
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setSelectedTime('');
                }}
              />
            </div>

            {/* Müsait Saat Dilimleri (Slots) */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-slate-700 font-semibold text-xs">
                  {selectedStaff.name} için Müsait Saatler
                </label>
                <span className="text-[11px] font-mono font-medium text-slate-500">
                  {availableSlots.filter((s) => s.available).length} boş slot
                </span>
              </div>

              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    return (
                      <button
                        type="button"
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-semibold transition border ${
                          !slot.available
                            ? 'bg-slate-100 text-slate-400 border-slate-200/60 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-1 ring-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Seçilen günde müsait saat bulunamadı. Lütfen başka bir gün veya berber seçiniz.
                </div>
              )}
            </div>
          </div>

          {/* 4. İLETİŞİM BİLGİLERİ (GİRİŞ YAPAN KULLANICIDAN OTOMATİK DOLDURULUR) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-xs font-bold text-white flex items-center justify-center">
                  4
                </span>
                <h3 className="text-sm font-bold text-slate-900">İletişim Bilgileriniz</h3>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Otomatik Doğrulandı
              </span>
            </div>

            {/* Müşteri Giriş Yapmış Olduğu İçin Form Tekrar İstenmez! */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs text-slate-500">Randevu Sahibi</div>
                  <div className="text-sm font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{currentUser.phone || '0544 222 33 44'}</div>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
                Kayıtlı Profil
              </span>
            </div>

            {/* 🔄 OTOMATİK PERİYODİK TIRAŞ DÖNGÜSÜ (Örn: Her 20 Günde 1 Tıraş) */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Otomatik Tıraş Döngüsü (Akıllı Periyodik Randevu)
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Saçınız uzadığında sıra beklemeden aynı saatte koltuğunuz otomatik rezerve edilsin.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRecurringEnabled(!isRecurringEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    isRecurringEnabled ? 'bg-slate-900' : 'bg-slate-300'
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
                <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs animate-in fade-in">
                  <span className="font-semibold text-slate-800">Tıraş Döngünüz:</span>
                  <div className="flex gap-2">
                    {[14, 20, 30].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setRecurringDays(days)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                          recurringDays === days
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white border-amber-200 text-slate-700 hover:bg-amber-100'
                        }`}
                      >
                        Her {days} Günde Bir
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Opsiyonel Not */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-xs">Berbere Not (Opsiyonel)</label>
              <input
                type="text"
                placeholder="Örn: Yanlar 2 numara olsun, ense düz kesilsin..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={!selectedTime}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-wide transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Randevuyu Kesinleştir</span>
                {selectedTime && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
                    {selectedDate} • {selectedTime}
                  </span>
                )}
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
