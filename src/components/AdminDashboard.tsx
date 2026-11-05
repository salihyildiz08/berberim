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
  const [activeTab, setActiveTab] = useState<'salons' | 'admins'>('salons');
  const [searchTerm, setSearchTerm] = useState('');
  
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
  const totalAppointments = appointments.length;
  const monthlySaaSSubscriptionPrice = 500;
  const estimatedMRR = activeSalons * monthlySaaSSubscriptionPrice;

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
    <div className="space-y-6">
      {/* SAAS MASTER METRİKLER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Abonelik Geliri (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {estimatedMRR.toLocaleString('tr-TR')} <span className="text-sm font-normal text-slate-500">TL / Ay</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> %100 tahsilat oranı
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kayıtlı İşletmeler</span>
            <Building2 className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {totalSalons} <span className="text-sm font-normal text-slate-500">Salon</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {activeSalons} aktif lisans kullanılıyor
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">SaaS Süper Adminleri</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {admins.length} <span className="text-sm font-normal text-slate-500">Yönetici</span>
          </div>
          <p className="text-[11px] text-purple-700 mt-1 font-medium">
            Salih Yıldız (Ana Yönetici)
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Supabase Veritabanı</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600 mt-2 truncate font-mono">
            crlduuku...
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            🟢 Canlı DB & RLS Aktif
          </p>
        </div>
      </div>

      {/* SEKME SEÇİCİ: İŞLETMELER VS ADMİNLER */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('salons')}
          className={`flex items-center gap-2 pb-3 text-xs font-bold transition border-b-2 ${
            activeTab === 'salons'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Kayıtlı İşletmeler ({salons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`flex items-center gap-2 pb-3 text-xs font-bold transition border-b-2 ${
            activeTab === 'admins'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>SaaS Süper Adminleri ({admins.length})</span>
        </button>
      </div>

      {/* 1. SEÇENEK: İŞLETMELER TABLOSU */}
      {activeTab === 'salons' && (
        <>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="İşletme adı, slug veya il/ilçe ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900"
              />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Yeni Berber / Salon Aç
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Kayıtlı İşletmeler ({filteredSalons.length})</span>
              <span className="text-slate-500 font-mono text-[10px]">Abonelik: 500 TL/Ay</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">İşletme Adı & URL</th>
                    <th className="p-4">Konum & İletişim</th>
                    <th className="p-4">SaaS Abonelik Durumu</th>
                    <th className="p-4">Otomasyon Modu</th>
                    <th className="p-4">Hesap Durumu</th>
                    <th className="p-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSalons.map((salon) => (
                    <tr key={salon.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{salon.name}</div>
                        <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                          berberim.app/{salon.slug}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{salon.district}, {salon.city}</div>
                        {salon.address && (
                          <div className="text-slate-500 text-[11px] truncate max-w-[200px]" title={salon.address}>
                            📍 {salon.address}
                          </div>
                        )}
                        <div className="text-slate-500 text-[11px] font-mono mt-0.5">{salon.phone}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          500 TL/Ay • Aktif Lisans
                        </span>
                      </td>
                      <td className="p-4 text-[11px]">
                        <div>{salon.autoConfirm ? '⚡ Otomatik Onay' : 'Manuel Onay'}</div>
                        <div className="text-slate-500">{salon.autoComplete ? '⏱️ Otomatik Tamamlama' : 'Manuel'}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            salon.isActive ? 'text-emerald-800 bg-emerald-50' : 'text-rose-800 bg-rose-50'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${salon.isActive ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                          {salon.isActive ? 'Aktif' : 'Donduruldu'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onToggleSalonStatus(salon.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            salon.isActive
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {salon.isActive ? 'Dondur' : 'Aktifleştir'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 2. SEÇENEK: SÜPER ADMİNLER TABLOSU & YENİ ADMİN EKLE */}
      {activeTab === 'admins' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">SaaS Sistem Yöneticileri</h3>
              <p className="text-xs text-slate-500">
                Bu listedeki kişiler SaaS Master paneline tam yetkiyle erişebilir ve yeni salonlar oluşturabilir.
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

      {/* YENİ SALON MODALI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 text-base">Yeni İşletme Kaydı (SaaS Tenant)</h3>
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
              <h3 className="font-bold text-slate-900 text-base">Yeni SaaS Süper Admini Tanımla</h3>
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
