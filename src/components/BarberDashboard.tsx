'use client';

import React, { useState, useEffect } from 'react';
import { Salon, Staff, Service, Appointment, AuthUser, CustomerProfile, WorkingHours } from '@/types';
import { initialWorkingHours } from '@/lib/dataStore';
import { TimelineAgenda } from '@/components/TimelineAgenda';
import { CustomerDirectory } from '@/components/CustomerDirectory';
import { SalonSettingsMenu } from '@/components/SalonSettingsMenu';
import {
  Calendar as CalendarIcon,
  Scissors,
  Users,
  Sliders,
  Plus,
  Trash2,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  BookOpen,
  Wallet,
  QrCode,
  ArrowLeft,
  DollarSign,
  Download,
  CreditCard,
  Banknote,
  Check,
  User,
} from 'lucide-react';

interface BarberDashboardProps {
  currentUser: AuthUser;
  salon: Salon;
  staffList: Staff[];
  services: Service[];
  appointments: Appointment[];
  customers: CustomerProfile[];
  workingHours?: WorkingHours[];
  onUpdateSalonSettings: (settings: Partial<Salon>) => void;
  onAddService: (newService: Omit<Service, 'id' | 'salonId' | 'isActive'>) => void;
  onDeleteService: (serviceId: string) => void;
  onAddStaff: (name: string, title: string, email: string) => void;
  onDeleteStaff: (staffId: string) => void;
  onUpdateStaffOffDays?: (staffId: string, weeklyOffDays: number[], leaveDates: string[]) => void;
  onUpdateWorkingHours?: (hours: WorkingHours[]) => void;
  onUpdateAppointmentStatus: (aptId: string, newStatus: Appointment['status']) => void;
  onAddQuickAppointment: (apt: Omit<Appointment, 'id' | 'createdAt'>) => void;
  onAddCustomer: (newCustomer: Omit<CustomerProfile, 'id' | 'createdAt'>) => void;
  onUpdateCustomerNote: (customerId: string, note: string) => void;
  onLogout?: () => void;
}

export const BarberDashboard: React.FC<BarberDashboardProps> = ({
  currentUser,
  salon,
  staffList,
  services,
  appointments,
  customers,
  workingHours,
  onUpdateSalonSettings,
  onAddService,
  onDeleteService,
  onAddStaff,
  onDeleteStaff,
  onUpdateStaffOffDays,
  onUpdateWorkingHours,
  onUpdateAppointmentStatus,
  onAddQuickAppointment,
  onAddCustomer,
  onUpdateCustomerNote,
  onLogout,
}) => {
  const isOwner = currentUser.role === 'barber_owner' || currentUser.role === 'admin';
  const staffId = currentUser.role === 'barber_staff' ? currentUser.staffId : undefined;

  const [activeTab, setActiveTab] = useState<'agenda' | 'customers' | 'services' | 'staff' | 'settings' | 'finance' | 'qrcode' | 'profile' | 'hours'>('agenda');
  const [calendarDate, setCalendarDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Çalışma Saatleri State
  const [hoursList, setHoursList] = useState<WorkingHours[]>(workingHours && workingHours.length > 0 ? workingHours : initialWorkingHours);
  const [hoursSavedSuccess, setHoursSavedSuccess] = useState(false);

  useEffect(() => {
    if (workingHours && workingHours.length > 0) {
      setHoursList(workingHours);
    }
  }, [workingHours]);

  // Personel Özel İzin Tarihi Input State
  const [newLeaveDates, setNewLeaveDates] = useState<{ [staffId: string]: string }>({});

  // Yeni Hizmet Ekleme Form State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState(45);
  const [newServicePrice, setNewServicePrice] = useState<number | ''>('');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Yeni Personel Ekleme Form State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffTitle, setNewStaffTitle] = useState('Senior Barber');
  const [newStaffEmail, setNewStaffEmail] = useState('');

  // Karekod Kopyalama Durumu
  const [copiedQrLink, setCopiedQrLink] = useState(false);

  // ⚡ Hafta içi tek tıkla 08:00 - 21:00 (Öğle Molası 13:00 - 14:00) şablonu uygula
  const handleApplyWeekday08To21 = () => {
    const updated: WorkingHours[] = [0, 1, 2, 3, 4, 5, 6].map((day) => {
      if (day >= 1 && day <= 6) {
        return {
          id: `wh-${day}`,
          salonId: salon.id,
          dayOfWeek: day,
          startTime: '08:00',
          endTime: '21:00',
          breakStart: '13:00',
          breakEnd: '14:00',
          isClosed: false,
        };
      }
      return {
        id: `wh-0`,
        salonId: salon.id,
        dayOfWeek: 0,
        startTime: '10:00',
        endTime: '18:00',
        isClosed: true,
      };
    });

    setHoursList(updated);
    if (onUpdateWorkingHours) {
      onUpdateWorkingHours(updated);
    }
    setHoursSavedSuccess(true);
    setTimeout(() => setHoursSavedSuccess(false), 3000);
  };

  const handleUpdateDayHour = (dayOfWeek: number, patch: Partial<WorkingHours>) => {
    const existing = hoursList.find((h) => h.dayOfWeek === dayOfWeek) || {
      id: `wh-${dayOfWeek}`,
      salonId: salon.id,
      dayOfWeek,
      startTime: '08:00',
      endTime: '21:00',
      breakStart: '13:00',
      breakEnd: '14:00',
      isClosed: false,
    };

    const updated = [0, 1, 2, 3, 4, 5, 6].map((d) => {
      if (d === dayOfWeek) {
        return { ...existing, ...patch };
      }
      const found = hoursList.find((h) => h.dayOfWeek === d);
      return found || {
        id: `wh-${d}`,
        salonId: salon.id,
        dayOfWeek: d,
        startTime: '08:00',
        endTime: '21:00',
        breakStart: '13:00',
        breakEnd: '14:00',
        isClosed: d === 0,
      };
    });

    setHoursList(updated);
    if (onUpdateWorkingHours) {
      onUpdateWorkingHours(updated);
    }
    setHoursSavedSuccess(true);
    setTimeout(() => setHoursSavedSuccess(false), 2000);
  };

  // Personel İzin Yönetimi
  const handleToggleStaffWeeklyOff = (st: Staff, dayIndex: number) => {
    const currentDays = st.weeklyOffDays || [];
    const exists = currentDays.includes(dayIndex);
    const updated = exists ? currentDays.filter((d) => d !== dayIndex) : [...currentDays, dayIndex];
    if (onUpdateStaffOffDays) {
      onUpdateStaffOffDays(st.id, updated, st.leaveDates || []);
    }
  };

  const handleAddStaffLeaveDate = (st: Staff) => {
    const dateToAdd = newLeaveDates[st.id];
    if (!dateToAdd) return;
    const currentDates = st.leaveDates || [];
    if (currentDates.includes(dateToAdd)) return;
    const updated = [...currentDates, dateToAdd].sort();
    if (onUpdateStaffOffDays) {
      onUpdateStaffOffDays(st.id, st.weeklyOffDays || [], updated);
    }
    setNewLeaveDates((prev) => ({ ...prev, [st.id]: '' }));
  };

  const handleRemoveStaffLeaveDate = (st: Staff, dateToRemove: string) => {
    const updated = (st.leaveDates || []).filter((d) => d !== dateToRemove);
    if (onUpdateStaffOffDays) {
      onUpdateStaffOffDays(st.id, st.weeklyOffDays || [], updated);
    }
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName) return;
    onAddService({
      name: newServiceName,
      durationMinutes: Number(newServiceDuration),
      price: newServicePrice === '' ? 0 : Number(newServicePrice),
      description: newServiceDesc,
    });
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDesc('');
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;
    onAddStaff(
      newStaffName,
      newStaffTitle,
      newStaffEmail || `${newStaffName.toLowerCase().replace(/\s+/g, '')}@salon.com`
    );
    setNewStaffName('');
    setNewStaffEmail('');
  };

  // Randevuları filtreleme (Eğer personel ise sadece kendi randevuları)
  const filteredAppointments = appointments.filter((a) => {
    if (a.appointmentDate !== calendarDate || a.status === 'cancelled') return false;
    if (!isOwner && staffId) return a.staffId === staffId;
    return true;
  });

  const inChairToday = filteredAppointments.filter((a) => a.status === 'in_chair');

  const totalCalculatedRevenue = filteredAppointments
    .filter((a) => a.status === 'completed' || a.status === 'confirmed' || a.status === 'in_chair')
    .reduce((sum, a) => sum + (a.price || 0), 0);

  const currentStaffObj = staffList.find((s) => s.id === staffId);
  const staffCommission = isOwner
    ? 0
    : (totalCalculatedRevenue * (currentStaffObj?.commissionRate || 40)) / 100;

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-6xl mx-auto">
      {/* ÜST BİLGİ VE METRİKLER (SAYFA 2 BİREBİR) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-stone-500 font-medium">
            {isOwner ? `Salon sahibi · ${salon.district}, ${salon.city}` : `✂️ ${currentUser.name} Koltuğu`}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-0.5">
            {salon.name}
          </h1>
        </div>

        {/* 4'lü Metrik Kartları (SAYFA 2 BİREBİR) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white border border-[#EBE7DF] rounded-2xl p-3 px-4 shadow-xs min-w-[110px]">
            <div className="text-[11px] text-stone-500 font-medium">Bugün randevu</div>
            <div className="text-xl font-black text-stone-900 mt-0.5">8</div>
          </div>

          <div className="bg-white border border-[#EBE7DF] rounded-2xl p-3 px-4 shadow-xs min-w-[110px]">
            <div className="text-[11px] text-stone-500 font-medium">Şu an koltukta</div>
            <div className="text-xl font-black text-stone-900 mt-0.5">1</div>
          </div>

          <div className="bg-white border border-[#EBE7DF] rounded-2xl p-3 px-4 shadow-xs min-w-[110px]">
            <div className="text-[11px] text-stone-500 font-medium">Bekleyen onay</div>
            <div className="text-xl font-black text-stone-900 mt-0.5">0</div>
          </div>

          <div className="bg-white border border-[#EBE7DF] rounded-2xl p-3 px-4 shadow-xs min-w-[110px]">
            <div className="text-[11px] text-stone-500 font-medium">Günlük ciro</div>
            <div className="text-xl font-black text-stone-900 mt-0.5">₺3.350</div>
          </div>
        </div>
      </div>

      {/* MASAÜSTÜ YÖNETİM SEKMELERİ (SAYFA 2 BİREBİR) */}
      <div className="flex border-b border-[#EBE7DF] gap-6 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('agenda')}
          className={`pb-3 transition border-b-2 whitespace-nowrap ${
            activeTab === 'agenda'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Ajanda
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 transition border-b-2 whitespace-nowrap ${
            activeTab === 'customers'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Müşteriler
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`pb-3 transition border-b-2 whitespace-nowrap ${
            activeTab === 'finance'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Finans ve kasa
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-3 transition border-b-2 whitespace-nowrap ${
            activeTab === 'staff' || activeTab === 'services' || activeTab === 'hours' || activeTab === 'qrcode'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Salon
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 transition border-b-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Ayarlar
        </button>
      </div>

      {/* SALON ALTI ALT SEKMELER (Salon sekmesi seçiliyse) */}
      {(activeTab === 'staff' || activeTab === 'services' || activeTab === 'hours' || activeTab === 'qrcode') && (
        <div className="flex items-center gap-2 bg-white border border-[#EBE7DF] p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'staff' ? 'bg-[#F8F6F0] text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Personeller & İzinler ({staffList.length})
          </button>
          <button
            onClick={() => setActiveTab('hours')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'hours' ? 'bg-[#F8F6F0] text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Çalışma Saatleri & Mola
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'services' ? 'bg-[#F8F6F0] text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Hizmet Menüsü ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('qrcode')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'qrcode' ? 'bg-[#F8F6F0] text-stone-900 font-bold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Karekodum
          </button>
        </div>
      )}

      {/* 1. SEKMELER İÇERİĞİ */}

      {/* A) KOLTUK AJANDASI & TIMELINE (REFERANS GÖRSEL 2 STANDARDI) */}
      {activeTab === 'agenda' && (
        <TimelineAgenda
          currentDate={calendarDate}
          onDateChange={setCalendarDate}
          staffList={staffList}
          appointments={appointments}
          services={services}
          onAddQuickAppointment={onAddQuickAppointment}
          onUpdateStatus={onUpdateAppointmentStatus}
          currentStaffId={staffId}
          isOwnerView={isOwner}
        />
      )}

      {/* B) MÜŞTERİ REHBERİ (CRM) */}
      {activeTab === 'customers' && (
        <CustomerDirectory
          customers={customers}
          staffList={staffList}
          services={services}
          onAddCustomer={onAddCustomer}
          onUpdateCustomerNote={onUpdateCustomerNote}
        />
      )}

      {/* C) PROFİL & AYARLAR MENÜSÜ (REFERANS GÖRSEL 1 STANDARDI) */}
      {activeTab === 'profile' && (
        <SalonSettingsMenu
          currentUser={currentUser}
          salon={salon}
          staffList={staffList}
          customers={customers}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onLogout={onLogout || (() => {})}
        />
      )}

      {/* D) FİNANS / GELİR-GİDER & Z-RAPORU */}
      {isOwner && activeTab === 'finance' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab('profile')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Profil & Menüye Dön
            </button>
            <span className="text-xs font-bold text-slate-500 font-mono">
              📅 {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Günlük Ciro ve Kasa Özeti Kartı */}
          <div className="bg-[#151b26] text-white p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bugünkü Salon Cirosu</span>
                <h2 className="text-3xl font-extrabold mt-1 text-white">
                  {totalCalculatedRevenue.toLocaleString('tr-TR')} ₺
                </h2>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Wallet className="w-6 h-6" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Banknote className="w-3.5 h-3.5 text-amber-400" /> Nakit Kasa
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {Math.round(totalCalculatedRevenue * 0.6).toLocaleString('tr-TR')} ₺
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">%60 Nakit İşlem</div>
              </div>

              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" /> Kredi Kartı / POS
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {Math.round(totalCalculatedRevenue * 0.4).toLocaleString('tr-TR')} ₺
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">%40 POS İşlem</div>
              </div>
            </div>
          </div>

          {/* Personel Hakediş ve Prim Dağılımı */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Usta Bazlı Kazanç & Prim Hakedişleri</h3>
            <div className="divide-y divide-slate-100">
              {staffList.map((st) => {
                const staffApts = filteredAppointments.filter((a) => a.staffId === st.id);
                const staffRev = staffApts.reduce((sum, a) => sum + (a.price || 0), 0);
                const staffShare = (staffRev * (st.commissionRate || 40)) / 100;

                return (
                  <div key={st.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{st.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {staffApts.length} randevu • Prim Oranı: %{st.commissionRate || 40}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-emerald-600">
                        +{staffShare.toLocaleString('tr-TR')} ₺ Prim
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Toplam Üretim: {staffRev.toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* E) KAREKODUM & MASA STANDI */}
      {isOwner && activeTab === 'qrcode' && (
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab('profile')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Profil & Menüye Dön
            </button>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Masa Standı Hazır
            </span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 text-center space-y-5 shadow-xs">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{salon.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Müşterileriniz bu karekodu telefon kamerasıyla okutarak anında randevu alabilir.
              </p>
            </div>

            {/* Simüle Edilmiş SVG QR Kod */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <div className="w-48 h-48 bg-white border-4 border-slate-900 rounded-xl p-3 flex flex-col items-center justify-center relative">
                <QrCode className="w-36 h-36 text-slate-900" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-md">
                    <Scissors className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
              </div>
              <div className="text-[11px] font-mono font-bold text-slate-600 mt-3">
                berberim.app/{salon.slug}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://berberim.app/${salon.slug}`);
                  setCopiedQrLink(true);
                  setTimeout(() => setCopiedQrLink(false), 2000);
                }}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
              >
                {copiedQrLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedQrLink ? 'Randevu Linki Kopyalandı!' : 'Randevu Bağlantısını Kopyala'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Masa Standı Şablonunu Yazdır (A5 / A6)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* F) HİZMET MENÜSÜ */}
      {isOwner && activeTab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 h-fit shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Yeni Hizmet Tanımla
            </h3>
            <form onSubmit={handleCreateService} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Hizmet Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Cilt Bakımı & Buhar"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Koltuk Süresi *</label>
                  <select
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                  >
                    <option value={15}>15 Dakika</option>
                    <option value={30}>30 Dakika</option>
                    <option value={45}>45 Dakika</option>
                    <option value={60}>60 Dakika</option>
                    <option value={75}>75 Dakika</option>
                    <option value={90}>90 Dakika</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fiyat (₺)</label>
                  <input
                    type="number"
                    placeholder="0 = Fiyatsız"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Açıklama (Opsiyonel)</label>
                <textarea
                  rows={2}
                  placeholder="Hizmet detayları..."
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition"
              >
                Menüye Ekle
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Aktif Hizmet Listesi ({services.length})</h3>
            <div className="divide-y divide-slate-100">
              {services.map((srv) => (
                <div key={srv.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{srv.name}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-2">
                      <span>⏱️ {srv.durationMinutes} dk</span>
                      {srv.price > 0 && <span>💰 {srv.price} TL</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteService(srv.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* G) PERSONEL YÖNETİMİ & KOLTUKLAR */}
      {isOwner && activeTab === 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 h-fit shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Yeni Personel / Stilist Koltuğu
            </h3>
            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Usta Adı Soyadı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Yusuf Kalın"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Unvan *</label>
                <input
                  type="text"
                  value={newStaffTitle}
                  onChange={(e) => setNewStaffTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Giriş E-postası (Şifresiz Koltuk Girişi)</label>
                <input
                  type="email"
                  placeholder="yusuf@salon.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition"
              >
                Personeli Kaydet
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Salon Ekibi & İzin Yönetimi ({staffList.length})</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ustaların haftalık izin günlerini ve gelmediği özel tarihleri belirleyin. İzinli günlerde randevu otomatik kilitlenir.
                </p>
              </div>
            </div>

            <div className="space-y-4 divide-y divide-slate-100">
              {staffList.map((st) => {
                const dayPills = [
                  { label: 'Paz', idx: 0 },
                  { label: 'Pzt', idx: 1 },
                  { label: 'Sal', idx: 2 },
                  { label: 'Çar', idx: 3 },
                  { label: 'Per', idx: 4 },
                  { label: 'Cum', idx: 5 },
                  { label: 'Cmt', idx: 6 },
                ];

                return (
                  <div key={st.id} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{st.name}</div>
                          <div className="text-slate-500 text-[11px]">
                            {st.title} • {st.email || 'E-posta atanmadı'} • Prim: %{st.commissionRate || 40}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteStaff(st.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                        title="Personeli Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Haftalık İzin Günleri Seçimi */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700">Haftalık Sabit İzin Günleri:</span>
                        <span className="text-[10px] text-slate-400">Turuncu olan günlerde dükkanda yok</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {dayPills.map((d) => {
                          const isOff = (st.weeklyOffDays || []).includes(d.idx);
                          return (
                            <button
                              key={d.idx}
                              type="button"
                              onClick={() => handleToggleStaffWeeklyOff(st, d.idx)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                isOff
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                              title={isOff ? `${d.label}: İzinli gün (Randevu alınamaz)` : `${d.label}: Çalışıyor`}
                            >
                              {d.label} {isOff ? '🏖️' : ''}
                            </button>
                          );
                        })}
                      </div>

                      {/* Özel Tarih İzni / Gelmediği Günler */}
                      <div className="pt-2 border-t border-slate-200/60 mt-2 space-y-2">
                        <div className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                          <span>Gelmeyeceği / İzinli Özel Tarih Ekle:</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={newLeaveDates[st.id] || ''}
                            onChange={(e) => setNewLeaveDates((prev) => ({ ...prev, [st.id]: e.target.value }))}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddStaffLeaveDate(st)}
                            disabled={!newLeaveDates[st.id]}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs transition flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> İzin Ekle
                          </button>
                        </div>

                        {/* Eklenen İzin Tarihleri Badgeleri */}
                        {st.leaveDates && st.leaveDates.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {st.leaveDates.map((ld) => (
                              <span
                                key={ld}
                                className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium"
                              >
                                <span>📅 {ld} (Gelmedi)</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStaffLeaveDate(st, ld)}
                                  className="text-rose-400 hover:text-rose-700 font-bold ml-1 text-xs"
                                  title="İzni Kaldır"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* H) ÇALIŞMA SAATLERİ & MOLA DÜZENİ */}
      {isOwner && activeTab === 'hours' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ÜST BİLGİ VE HIZLI ŞABLON BUTONU */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </span>
                <h3 className="text-base font-extrabold text-slate-900">Çalışma Saatleri & Mola Düzeni</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-lg">
                Müşterilerin randevu alabileceği salon açılış-kapanış saatlerini ve öğle molasını belirleyin. Mola saatlerinde müşterilere randevu slotu açılmaz.
              </p>
            </div>

            <button
              type="button"
              onClick={handleApplyWeekday08To21}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>⚡ Hafta İçi 08:00 - 21:00 Uygula (Mola: 13:00 - 14:00)</span>
            </button>
          </div>

          {hoursSavedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Çalışma saatleri ve mola düzeni başarıyla kaydedildi! Randevu takvimi güncellendi.
            </div>
          )}

          {/* GÜN BAZLI ÇALIŞMA SAATLERİ LİSTESİ */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
            <div className="grid grid-cols-1 divide-y divide-slate-100">
              {[
                { day: 1, name: 'Pazartesi' },
                { day: 2, name: 'Salı' },
                { day: 3, name: 'Çarşamba' },
                { day: 4, name: 'Perşembe' },
                { day: 5, name: 'Cuma' },
                { day: 6, name: 'Cumartesi' },
                { day: 0, name: 'Pazar' },
              ].map((item) => {
                const wh = hoursList.find((h) => h.dayOfWeek === item.day) || {
                  id: `wh-${item.day}`,
                  salonId: salon.id,
                  dayOfWeek: item.day,
                  startTime: '08:00',
                  endTime: '21:00',
                  breakStart: '13:00',
                  breakEnd: '14:00',
                  isClosed: item.day === 0,
                };

                return (
                  <div
                    key={item.day}
                    className={`py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      wh.isClosed ? 'opacity-60 bg-slate-50/50 px-3 rounded-xl' : ''
                    }`}
                  >
                    <div className="w-36">
                      <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                      <div className="text-[11px] font-semibold mt-0.5">
                        {wh.isClosed ? (
                          <span className="text-rose-600">Kapalı</span>
                        ) : (
                          <span className="text-emerald-700">Açık • {wh.startTime} - {wh.endTime}</span>
                        )}
                      </div>
                    </div>

                    {/* Açık / Kapalı Toggle */}
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!wh.isClosed}
                          onChange={(e) => handleUpdateDayHour(item.day, { isClosed: !e.target.checked })}
                          className="rounded text-slate-900 focus:ring-0 w-4 h-4"
                        />
                        <span>{wh.isClosed ? 'Dükkan Kapalı' : 'Dükkan Açık'}</span>
                      </label>
                    </div>

                    {/* Saat Seçimleri (Açık ise) */}
                    {!wh.isClosed && (
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Açılış & Kapanış */}
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                          <span className="text-slate-500 font-medium">Mesai:</span>
                          <input
                            type="time"
                            value={wh.startTime}
                            onChange={(e) => handleUpdateDayHour(item.day, { startTime: e.target.value })}
                            className="bg-transparent font-bold text-slate-900 focus:outline-none"
                          />
                          <span className="text-slate-400">-</span>
                          <input
                            type="time"
                            value={wh.endTime}
                            onChange={(e) => handleUpdateDayHour(item.day, { endTime: e.target.value })}
                            className="bg-transparent font-bold text-slate-900 focus:outline-none"
                          />
                        </div>

                        {/* Öğle / Dinlenme Molası */}
                        <div className="flex items-center gap-1 bg-amber-50/80 border border-amber-200/80 rounded-lg px-2 py-1">
                          <span className="text-amber-800 font-medium">☕ Mola:</span>
                          <input
                            type="time"
                            value={wh.breakStart || '13:00'}
                            onChange={(e) => handleUpdateDayHour(item.day, { breakStart: e.target.value })}
                            className="bg-transparent font-bold text-amber-950 focus:outline-none"
                          />
                          <span className="text-amber-500">-</span>
                          <input
                            type="time"
                            value={wh.breakEnd || '14:00'}
                            onChange={(e) => handleUpdateDayHour(item.day, { breakEnd: e.target.value })}
                            className="bg-transparent font-bold text-amber-950 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* H) OTOMASYON & RANDEVU AYARLARI */}
      {isOwner && activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab('profile')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Profil & Menüye Dön
            </button>
            <span className="text-xs font-bold text-slate-500">Randevu Parametreleri</span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">Akıllı Salon Otomasyon Ayarları</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              İşletmenin müdahale etmesine gerek kalmadan randevuların kendi kendine akmasını sağlayan motor.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900">⚡ Anında Otomatik Onaylama Modu</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Müşteri boş bir saate randevu aldığında berberin tek tek 'Onayla' butonuna basmasına gerek kalmadan takvime doğrudan işlenir.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSalonSettings({ autoConfirm: !salon.autoConfirm })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  salon.autoConfirm ? 'bg-slate-900' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    salon.autoConfirm ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900">⏱️ Süre Dolunca Otomatik Tamamlama</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Randevu saati bittiğinde randevu otomatik olarak 'Tamamlandı' kabul edilir; berberin gidip elle durum değiştirmesi gerekmez.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSalonSettings({ autoComplete: !salon.autoComplete })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  salon.autoComplete ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    salon.autoComplete ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📱 MOBİL SABİT ALT NAVİGASYON BARI (REFERANS GÖRSEL 1 & 2 STANDARDI) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2.5 px-6 flex md:hidden items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
            activeTab === 'agenda' ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span>Randevular</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
            activeTab === 'customers' ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Müşteriler</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
            activeTab === 'profile' || activeTab === 'finance' || activeTab === 'qrcode' || activeTab === 'settings' || activeTab === 'staff' || activeTab === 'services'
              ? 'text-slate-900'
              : 'text-slate-400'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profil</span>
        </button>
      </div>
    </div>
  );
};
