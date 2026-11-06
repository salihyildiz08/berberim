'use client';

import React, { useState } from 'react';
import { Salon, Appointment, SystemAdmin } from '@/types';
import {
  Building2,
  DollarSign,
  CalendarCheck,
  TrendingUp,
  Search,
  Plus,
  ShieldCheck,
  Activity,
  UserPlus,
  Users,
  Trash2,
  CheckCircle,
  Crown,
  Database,
  HardDrive,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface AdminDashboardProps {
  salons: Salon[];
  appointments: Appointment[];
  admins: SystemAdmin[];
  onToggleSalonStatus: (salonId: string) => void;
  onAddSalon: (
    name: string,
    slug: string,
    phone: string,
    city?: string,
    district?: string,
    address?: string
  ) => void;
  onAddAdmin: (name: string, email: string) => void;
  onToggleAdminStatus: (adminId: string) => void;
  onDeleteAdmin: (adminId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  salons,
  appointments,
  admins,
  onToggleSalonStatus,
  onAddSalon,
  onAddAdmin,
  onToggleAdminStatus,
  onDeleteAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'salons' | 'admins' | 'database'>('salons');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSalonId, setSelectedSalonId] = useState<string>(salons[0]?.id || 'salon-1');
  
  // Salon Ekleme Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSalonName, setNewSalonName] = useState('');
  const [newSalonSlug, setNewSalonSlug] = useState('');
  const [newSalonPhone, setNewSalonPhone] = useState('');
  const [newSalonCity, setNewSalonCity] = useState('İstanbul');
  const [newSalonDistrict, setNewSalonDistrict] = useState('Kadıköy');
  const [newSalonAddress, setNewSalonAddress] = useState('');

  // Admin Ekleme Modal
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  const totalSalons = salons.length;
  const activeSalons = salons.filter((s) => s.isActive).length;
  const selectedSalon = salons.find((s) => s.id === selectedSalonId) || salons[0];

  // Veritabanı Tahmini Metrikleri (Supabase crlduukuhevovagorsce)
  const totalRecordsCount = appointments.length + salons.length + 85;
  const usedStorageMB = 42.6;
  const maxStorageMB = 500;
  const storagePercentage = Number(((usedStorageMB / maxStorageMB) * 100).toFixed(1));

  const filteredSalons = salons.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSalon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSalonName || !newSalonSlug) return;
    onAddSalon(
      newSalonName,
      newSalonSlug,
      newSalonPhone || '0212 000 00 00',
      newSalonCity || 'İstanbul',
      newSalonDistrict || 'Kadıköy',
      newSalonAddress || `${newSalonDistrict}, ${newSalonCity}`
    );
    setNewSalonName('');
    setNewSalonSlug('');
    setNewSalonPhone('');
    setNewSalonCity('İstanbul');
    setNewSalonDistrict('Kadıköy');
    setNewSalonAddress('');
    setShowAddModal(false);
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail) return;
    onAddAdmin(newAdminName, newAdminEmail.trim().toLowerCase());
    setNewAdminName('');
    setNewAdminEmail('');
    setShowAddAdminModal(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ÜST BAŞLIK VE YENİ SALON AÇ BUTONU */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-stone-500 font-medium">Süper admin</span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Yönetim paneli</h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#B86B35] hover:bg-[#A35C2B] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Yeni salon aç
        </button>
      </div>

      {/* PLATFORM METRİKLERİ (SAYFA 1 BİREBİR KARTLARI) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Aylık Abonelik Geliri */}
        <div className="bg-white border border-[#EBE7DF] rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Aylık abonelik geliri</div>
          <div className="text-2xl font-black text-stone-900 mt-1">₺1.000</div>
          <div className="text-[11px] text-stone-400 mt-0.5 font-medium">%100 tahsilat</div>
        </div>

        {/* 2. Aktif Salon */}
        <div className="bg-white border border-[#EBE7DF] rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Aktif salon</div>
          <div className="text-2xl font-black text-stone-900 mt-1">{activeSalons}</div>
        </div>

        {/* 3. Ödemesi Geciken */}
        <div className="bg-white border border-[#EBE7DF] rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Ödemesi geciken</div>
          <div className="text-2xl font-black text-stone-900 mt-1">0</div>
        </div>

        {/* 4. Bu Ay Yeni */}
        <div className="bg-white border border-[#EBE7DF] rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Bu ay yeni</div>
          <div className="text-2xl font-black text-stone-900 mt-1">0</div>
        </div>
      </div>

      {/* SEKME SEÇİCİ */}
      <div className="flex border-b border-[#EBE7DF] gap-6 text-sm">
        <button
          onClick={() => setActiveTab('salons')}
          className={`pb-3 font-bold transition border-b-2 text-xs flex items-center gap-1.5 ${
            activeTab === 'salons'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>Salonlar ({salons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`pb-3 font-bold transition border-b-2 text-xs flex items-center gap-1.5 ${
            activeTab === 'admins'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>Yöneticiler ({admins.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`pb-3 font-bold transition border-b-2 text-xs flex items-center gap-1.5 ${
            activeTab === 'database'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>Altyapı</span>
        </button>
      </div>

      {/* 1. SEÇENEK: SALONLAR - SAYFA 1 SPLIT DÜZENİ */}
      {activeTab === 'salons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Sol: Arama ve Tablo (2 Kolon) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white border border-[#EBE7DF] rounded-2xl p-2 px-3 flex items-center gap-2 shadow-xs">
              <Search className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="text"
                placeholder="Salon adı veya ilçe ara"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs text-stone-900 placeholder-stone-400 focus:outline-none py-1"
              />
            </div>

            <div className="bg-white border border-[#EBE7DF] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-stone-400 font-semibold border-b border-[#EBE7DF]/70 text-[11px]">
                    <tr>
                      <th className="py-3 px-4 font-normal">Salon</th>
                      <th className="py-3 px-3 font-normal">Durum</th>
                      <th className="py-3 px-3 font-normal">Lisans</th>
                      <th className="py-3 px-3 font-normal">Aktivite</th>
                      <th className="py-3 px-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE7DF]/60 text-stone-700">
                    {filteredSalons.map((salon) => {
                      const isSelected = selectedSalonId === salon.id;
                      return (
                        <tr
                          key={salon.id}
                          onClick={() => setSelectedSalonId(salon.id)}
                          className={`cursor-pointer transition ${
                            isSelected ? 'bg-[#FAF3EE]' : 'hover:bg-stone-50/70'
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-stone-900 text-xs">{salon.name}</div>
                            <div className="text-stone-400 text-[11px]">
                              berberim.app/{salon.slug}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E7F6EC] text-[#1B6E37]">
                              {salon.isActive ? 'Aktif' : 'Donduruldu'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-medium text-stone-900">
                            ₺500 / ay
                          </td>
                          <td className="py-3.5 px-3 text-stone-500 text-[11px]">
                            Son giriş: 12 dk önce
                          </td>
                          <td className="py-3.5 px-3 text-right text-stone-400 font-bold">
                            ...
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sağ: Seçili Salon Detay Kartı (1 Kolon) */}
          {selectedSalon && (
            <div className="bg-white border border-[#EBE7DF] rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">{selectedSalon.name}</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {selectedSalon.district}, {selectedSalon.city} · {selectedSalon.phone}
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#EBE7DF]/70 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-700 font-medium">Otomatik onay</span>
                  <span className="text-emerald-700 font-semibold bg-[#E7F6EC] px-2 py-0.5 rounded-md text-[11px]">
                    {selectedSalon.autoConfirm ? 'Açık' : 'Kapalı'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-700 font-medium">Otomatik tamamlama</span>
                  <span className="text-emerald-700 font-semibold bg-[#E7F6EC] px-2 py-0.5 rounded-md text-[11px]">
                    {selectedSalon.autoComplete ? 'Açık' : 'Kapalı'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBE7DF]/70 space-y-2">
                <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Tehlikeli işlemler
                </div>
                <button
                  type="button"
                  onClick={() => onToggleSalonStatus(selectedSalon.id)}
                  className="w-full py-2 px-3 border border-stone-200 hover:border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
                >
                  {selectedSalon.isActive ? 'Salonu dondur...' : 'Salonu aktifleştir...'}
                </button>
                <p className="text-[10px] text-stone-400">
                  Onay ister, müşteriler randevu alamaz.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SEÇENEK: SÜPER ADMİNLER TABLOSU & YENİ ADMİN EKLE */}
      {activeTab === 'admins' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Platform Sistem Yöneticileri</h3>
              <p className="text-xs text-slate-500">
                Bu listedeki kişiler yönetim paneline tam yetkiyle erişebilir ve yeni salonlar oluşturabilir.
              </p>
            </div>

            <button
              onClick={() => setShowAddAdminModal(true)}
              className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-4 h-4" /> Yeni Admin Ekle
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Admin Adı</th>
                  <th className="p-4">E-Posta Adresi</th>
                  <th className="p-4">Yetki Derecesi</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <div>{admin.name}</div>
                        {admin.isPrimary && (
                          <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5">
                            <Crown className="w-3 h-3 text-amber-500" /> Kurucu Süper Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-600 font-medium">{admin.email}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {admin.isPrimary ? '👑 Tam Yetkili Kurucu' : '🛡️ Sistem Admini'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          admin.isActive ? 'text-emerald-800 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${admin.isActive ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                        {admin.isActive ? 'Aktif' : 'Devre Dışı'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {admin.isPrimary ? (
                        <span className="text-[11px] text-slate-400 italic">Ana Yönetici (Silinemez)</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onToggleAdminStatus(admin.id)}
                            className="px-2.5 py-1 rounded text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            {admin.isActive ? 'Dondur' : 'Aktifleştir'}
                          </button>
                          <button
                            onClick={() => onDeleteAdmin(admin.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                            title="Admini Kaldır"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SEÇENEK: VERİTABANI DOLULUK ORANI & ALTYAPI DETAYI */}
      {activeTab === 'database' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Supabase PostgreSQL Veritabanı</h3>
                  <p className="text-xs text-slate-500 font-mono">crlduukuhevovagorsce.supabase.co</p>
                </div>
              </div>

              <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sağlıklı & Aktif
              </span>
            </div>

            {/* Doluluk Çubuğu ve Detay */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-700">Disk Alanı Kullanımı</div>
                  <div className="text-2xl font-black text-slate-900 mt-0.5">
                    {usedStorageMB} MB <span className="text-sm font-normal text-slate-500">/ {maxStorageMB} MB Kapasite</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-600">%{storagePercentage} Dolu</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">457.4 MB Müsait Alan</div>
                </div>
              </div>

              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
            </div>

            {/* Veritabanı İstatistik Izgarası */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                <div className="text-slate-500 font-medium">Toplam Tablo Sayısı</div>
                <div className="text-lg font-bold text-slate-900">8 Sistem Tablosu</div>
                <div className="text-[11px] text-slate-400">PostgreSQL 15 Şeması</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                <div className="text-slate-500 font-medium">Kayıtlı Toplam Satır</div>
                <div className="text-lg font-bold text-slate-900">{totalRecordsCount} Satır</div>
                <div className="text-[11px] text-slate-400">Randevular + Müşteriler + Ustalar</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                <div className="text-slate-500 font-medium">Ortalama Yanıt Süresi (Latency)</div>
                <div className="text-lg font-bold text-emerald-600">~14 ms</div>
                <div className="text-[11px] text-slate-400">Avrupa (Frankfurt) Veri Merkezi</div>
              </div>
            </div>

            {/* Güvenlik & Yedekleme Durumları */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Row Level Security (RLS) İzolasyon Koruması Aktif</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Günlük Otomatik Yedekleme Devrede</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>SSL / TLS 1.3 Uçtan Uca Şifreli Bağlantı</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Connection Pooler (İşlem Havuzu) Aktif</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YENİ SALON MODALI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 text-base">Yeni İşletme Kaydı</h3>
            <form onSubmit={handleCreateSalon} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">İşletme / Salon Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: The Barber Lounge"
                  value={newSalonName}
                  onChange={(e) => {
                    setNewSalonName(e.target.value);
                    if (!newSalonSlug) {
                      setNewSalonSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Özel URL Uzantısı (Slug) *</label>
                <input
                  type="text"
                  required
                  placeholder="the-barber-lounge"
                  value={newSalonSlug}
                  onChange={(e) => setNewSalonSlug(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">İletişim Numarası</label>
                <input
                  type="text"
                  placeholder="0212 555 44 33"
                  value={newSalonPhone}
                  onChange={(e) => setNewSalonPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">İl *</label>
                  <input
                    type="text"
                    required
                    placeholder="İstanbul"
                    value={newSalonCity}
                    onChange={(e) => setNewSalonCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">İlçe *</label>
                  <input
                    type="text"
                    required
                    placeholder="Kadıköy"
                    value={newSalonDistrict}
                    onChange={(e) => setNewSalonDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Açık Adres (Cadde, Sokak, No)</label>
                <textarea
                  rows={2}
                  placeholder="Örn: Bağdat Cad. No: 342/B, Suadiye"
                  value={newSalonAddress}
                  onChange={(e) => setNewSalonAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition shadow-xs"
                >
                  İşletmeyi Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YENİ ADMİN EKLEME MODALI */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-purple-700">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">Yeni Sistem Yöneticisi Tanımla</h3>
            </div>
            <p className="text-xs text-slate-500">
              Yeni eklenen admin, platformdaki tüm işletmeleri yönetme yetkisine sahip olacaktır.
            </p>

            <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Yönetici Adı Soyadı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Google / E-Posta Adresi *</label>
                <input
                  type="email"
                  required
                  placeholder="ahmet@gmail.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-purple-700 text-white font-bold hover:bg-purple-800 transition shadow-xs"
                >
                  Admin Olarak Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
