'use client';

import React, { useState } from 'react';
import { Salon, Staff, Service, Appointment, AuthUser, CustomerProfile } from '@/types';
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
  onUpdateSalonSettings: (settings: Partial<Salon>) => void;
  onAddService: (newService: Omit<Service, 'id' | 'salonId' | 'isActive'>) => void;
  onDeleteService: (serviceId: string) => void;
  onAddStaff: (name: string, title: string, email: string) => void;
  onDeleteStaff: (staffId: string) => void;
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
  onUpdateSalonSettings,
  onAddService,
  onDeleteService,
  onAddStaff,
  onDeleteStaff,
  onUpdateAppointmentStatus,
  onAddQuickAppointment,
  onAddCustomer,
  onUpdateCustomerNote,
  onLogout,
}) => {
  const isOwner = currentUser.role === 'barber_owner' || currentUser.role === 'admin';
  const staffId = currentUser.role === 'barber_staff' ? currentUser.staffId : undefined;

  const [activeTab, setActiveTab] = useState<'agenda' | 'customers' | 'services' | 'staff' | 'settings' | 'finance' | 'qrcode' | 'profile'>('agenda');
  const [calendarDate, setCalendarDate] = useState<string>(new Date().toISOString().split('T')[0]);

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
    <div className="space-y-6 pb-20 md:pb-6">
      {/* ÜST BİLGİ VE METRİKLER */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                isOwner
                  ? 'bg-amber-50 text-amber-800 border-amber-200/60'
                  : 'bg-blue-50 text-blue-800 border-blue-200/60'
              }`}
            >
              {isOwner ? '👑 Salon Yöneticisi (Patron)' : `✂️ ${currentUser.name} Koltuğu`}
            </span>
            <span className="text-xs text-slate-500">• {salon.district}, {salon.city}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {salon.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isOwner ? (
              <>Tüm kadronun randevuları, müşteri havuzu ve salonun toplam hasılatı yönetiliyor.</>
            ) : (
              <>Sadece sizin koltuğunuza randevu alan müşteriler listelenmektedir.</>
            )}
          </p>
        </div>

        {/* Metrik Kartları */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 min-w-[120px]">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isOwner ? 'Bugün Randevu' : 'Koltuk Sıram'}
            </div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{filteredAppointments.length} Kişi</div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl px-4 py-3 min-w-[120px]">
            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Şu An Koltukta</div>
            <div className="text-lg font-black text-amber-900 mt-0.5">{inChairToday.length} Müşteri</div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl px-4 py-3 min-w-[130px]">
            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              {isOwner ? 'Günlük Salon Cirosu' : 'Hak Edilen Prim'}
            </div>
            <div className="text-lg font-black text-emerald-700 mt-0.5">
              {isOwner
                ? `${totalCalculatedRevenue.toLocaleString('tr-TR')} TL`
                : `${staffCommission.toLocaleString('tr-TR')} TL`}
            </div>
          </div>
        </div>
      </div>

      {/* MASAÜSTÜ YÖNETİM SEKMELERİ */}
      <div className="hidden md:flex border-b border-slate-200 gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex items-center gap-2 pb-3 text-xs font-bold transition border-b-2 whitespace-nowrap ${
            activeTab === 'agenda'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarIcon className="w-4 h-4 text-slate-900" />
          <span>{isOwner ? 'Koltuk Ajandası & Takvim (Salon)' : 'Benim Randevu Ajandam'}</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 pb-3 text-xs font-bold transition border-b-2 whitespace-nowrap ${
            activeTab === 'customers'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Müşteri Rehberi & CRM ({customers.length})</span>
        </button>

        {isOwner && (
          <>
            <button
              onClick={() => setActiveTab('finance')}
              className={`flex items-center gap-2 pb-3 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                activeTab === 'finance'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Finans & Kasa</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2 pb-3 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                activeTab === 'services'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>Hizmet Menüsü ({services.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('staff')}
              className={`flex items-center gap-2 pb-3 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                activeTab === 'staff'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Personeller & Koltuklar ({staffList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('qrcode')}
              className={`flex items-center gap-2 pb-3 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                activeTab === 'qrcode'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Karekodum</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 pb-3 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Randevu Ayarları</span>
            </button>
          </>
        )}

        {/* Profil & Ayarlar Menüsü (Tüm roller görebilir) */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 pb-3 text-xs font-bold transition border-b-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profil & Menü</span>
        </button>
      </div>

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

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Salon Ekibi & Koltuklar ({staffList.length})</h3>
            <div className="divide-y divide-slate-100">
              {staffList.map((st) => (
                <div key={st.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{st.name}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {st.title} • {st.email || 'E-posta atanmadı'} • Prim: %{st.commissionRate || 40}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteStaff(st.id)}
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
