'use client';

import React, { useState } from 'react';
import { Salon, Staff, CustomerProfile, Service, Appointment, SystemAdmin, AuditLog } from '@/types';
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
  RotateCcw,
  Undo2,
  History,
  PhoneCall,
  MessageCircle,
  AlertTriangle,
  Scissors,
  UserCheck,
  Calendar,
  Sparkles,
  Phone,
  Eye,
  ExternalLink,
  Filter,
  Check,
  X,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

interface AdminDashboardProps {
  salons: Salon[];
  staffList: Staff[];
  customers: CustomerProfile[];
  services: Service[];
  appointments: Appointment[];
  admins: SystemAdmin[];
  auditLogs: AuditLog[];
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
  onAdminUpdateAppointment: (aptId: string, updates: Partial<Appointment>, reason?: string) => void;
  onRollbackAuditLog: (logId: string) => void;
  onImpersonateSalon: (salonId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  salons,
  staffList,
  customers,
  services,
  appointments,
  admins,
  auditLogs,
  onToggleSalonStatus,
  onAddSalon,
  onAddAdmin,
  onToggleAdminStatus,
  onDeleteAdmin,
  onAdminUpdateAppointment,
  onRollbackAuditLog,
  onImpersonateSalon,
}) => {
  const [activeTab, setActiveTab] = useState<'operations' | 'salons' | 'audit' | 'admins' | 'database'>('operations');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSalonId, setSelectedSalonId] = useState<string>(salons[0]?.id || 'salon-1');

  // Operasyon Masası Alt Sekmesi
  const [operationsSubTab, setOperationsSubTab] = useState<'appointments' | 'staff' | 'customers'>('appointments');
  const [opSearchQuery, setOpSearchQuery] = useState('');
  const [opStatusFilter, setOpStatusFilter] = useState<string>('all');

  // Acil Müdahale Düzenleme Modalı
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [editStaffId, setEditStaffId] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editStatus, setEditStatus] = useState<Appointment['status']>('confirmed');
  const [editReason, setEditReason] = useState('Müşteri telefonla aradı, randevu güncellendi.');

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

  // Audit Log Filtresi
  const [auditFilter, setAuditFilter] = useState<'all' | 'status_change' | 'appointment_cancel' | 'rollback'>('all');

  const totalSalons = salons.length;
  const activeSalons = salons.filter((s) => s.isActive).length;
  const selectedSalon = salons.find((s) => s.id === selectedSalonId) || salons[0];

  // Seçili salona ait personeller, müşteriler ve randevular
  const salonStaff = staffList.filter((s) => !s.salonId || s.salonId === selectedSalonId);
  const salonCustomers = customers.filter((c) => !c.salonId || c.salonId === selectedSalonId);
  const salonAppointments = appointments.filter((a) => !a.salonId || a.salonId === selectedSalonId);

  // Operasyon Masası Randevu Arama
  const filteredOpAppointments = salonAppointments.filter((a) => {
    if (opStatusFilter !== 'all' && a.status !== opStatusFilter) return false;
    if (!opSearchQuery) return true;
    const q = opSearchQuery.toLowerCase();
    return (
      a.customerName.toLowerCase().includes(q) ||
      a.customerPhone.includes(q) ||
      (a.staffName && a.staffName.toLowerCase().includes(q)) ||
      (a.serviceName && a.serviceName.toLowerCase().includes(q)) ||
      a.startTime.includes(q)
    );
  });

  // Veritabanı Metrikleri
  const totalRecordsCount = appointments.length + salons.length + customers.length + auditLogs.length + 85;
  const usedStorageMB = 44.8;
  const maxStorageMB = 500;
  const storagePercentage = Number(((usedStorageMB / maxStorageMB) * 100).toFixed(1));

  const handleOpenEditModal = (apt: Appointment) => {
    setEditingApt(apt);
    setEditStaffId(apt.staffId);
    setEditDate(apt.appointmentDate);
    setEditTime(apt.startTime);
    setEditStatus(apt.status);
    setEditReason('Müşteri telefonla aradı, randevu revize edildi.');
  };

  const handleSaveIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApt) return;

    const staffObj = staffList.find((s) => s.id === editStaffId);

    onAdminUpdateAppointment(
      editingApt.id,
      {
        staffId: editStaffId,
        staffName: staffObj?.name || editingApt.staffName,
        appointmentDate: editDate,
        startTime: editTime,
        status: editStatus,
      },
      editReason
    );

    setEditingApt(null);
  };

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

  // WhatsApp Mesajı
  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('90') ? cleanPhone : `90${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`;
    const text = encodeURIComponent(`Merhaba Sayın ${name}, Berberim sistem yöneticisinden aradınız, yardımcı olabilir miyiz?`);
    window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 text-stone-900">
      {/* 1. ÜST BAŞLIK VE HIZLI EYLEMLER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B86B35] animate-pulse" />
            <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">
              Süper Admin Master Kontrol Merkezi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-0.5">
            Berberler, Personel, Müşteri & Canlı Müdahale Masası
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onImpersonateSalon(selectedSalonId)}
            className="bg-[#FAF3EE] hover:bg-[#B86B35]/15 text-[#B86B35] border border-[#B86B35]/40 font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
            title="Seçili salonun arayüzüne canlı yönetici olarak geç"
          >
            <Scissors className="w-4 h-4" />
            <span>Salonu Canlı Yönet</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#B86B35] hover:bg-[#A35C2B] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Yeni Salon Aç
          </button>
        </div>
      </div>

      {/* 2. PLATFORM METRİKLERİ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#EBE7DF] rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Toplam Salon</div>
          <div className="text-2xl font-black text-stone-900 mt-1">{totalSalons}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5 font-bold">
            {activeSalons} aktif salon hizmette
          </div>
        </div>

        <div className="bg-white border border-[#EBE7DF] rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Kayıtlı Personel / Usta</div>
          <div className="text-2xl font-black text-[#B86B35] mt-1">{staffList.length}</div>
          <div className="text-[11px] text-stone-400 mt-0.5 font-medium">Tüm şubeler toplamı</div>
        </div>

        <div className="bg-white border border-[#EBE7DF] rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Kayıtlı Müşteri Portföyü</div>
          <div className="text-2xl font-black text-stone-900 mt-1">{customers.length}</div>
          <div className="text-[11px] text-stone-400 mt-0.5 font-medium">Aktif CRM rehberi</div>
        </div>

        <div className="bg-white border border-[#EBE7DF] rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Denetim Günlüğü (Audit)</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{auditLogs.length}</div>
          <div className="text-[11px] text-blue-600 mt-0.5 font-bold flex items-center gap-1">
            <Undo2 className="w-3 h-3" /> Tek tuşla geri alınabilir
          </div>
        </div>
      </div>

      {/* 3. ANA SEKME SEÇİCİ */}
      <div className="flex border-b border-[#EBE7DF] gap-6 text-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('operations')}
          className={`pb-3 font-bold transition border-b-2 text-xs flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'operations'
              ? 'border-[#B86B35] text-[#B86B35]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Canlı Müdahale Masası & Hiyerarşi</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 font-bold transition border-b-2 text-xs flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-[#B86B35] text-[#B86B35]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>İşlem Geçmişi & Geri Alma ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('salons')}
          className={`pb-3 font-bold transition border-b-2 text-xs flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'salons'
              ? 'border-[#B86B35] text-[#B86B35]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Salonlar ({salons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`pb-3 font-bold transition border-b-2 text-xs flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'admins'
              ? 'border-[#B86B35] text-[#B86B35]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Sistem Yöneticileri ({admins.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`pb-3 font-bold transition border-b-2 text-xs flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'database'
              ? 'border-[#B86B35] text-[#B86B35]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Altyapı & Sağlık</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. A) CANLI MÜDAHALE MASASI & HİYERARŞİ (KULLANICININ İSTEDİĞİ EN KRİTİK ALAN) */}
      {/* ========================================================================= */}
      {activeTab === 'operations' && (
        <div className="space-y-5">
          {/* SALON SEÇİCİ VE HIZLI ÇAĞRI BİLGİ KARTI */}
          <div className="bg-[#FAF3EE] border border-[#B86B35]/30 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#B86B35] text-white flex items-center justify-center font-black text-xl shadow-xs">
                💈
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#B86B35] uppercase tracking-wider block">
                  İşlem Yapılan Salon / Şube
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <select
                    value={selectedSalonId}
                    onChange={(e) => setSelectedSalonId(e.target.value)}
                    className="bg-white border border-[#EBE7DF] rounded-xl px-3 py-1.5 text-sm font-black text-stone-900 focus:outline-none focus:border-[#B86B35] shadow-2xs"
                  >
                    {salons.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.district}, {s.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-white border border-[#EBE7DF] px-3 py-1.5 rounded-xl font-bold text-stone-700">
                👥 {salonStaff.length} Usta
              </span>
              <span className="bg-white border border-[#EBE7DF] px-3 py-1.5 rounded-xl font-bold text-stone-700">
                📖 {salonCustomers.length} Müşteri
              </span>
              <span className="bg-white border border-[#EBE7DF] px-3 py-1.5 rounded-xl font-bold text-stone-700">
                🗓️ {salonAppointments.length} Randevu
              </span>
            </div>
          </div>

          {/* ALT SEKMELER: RANDEVULAR (MÜDAHALE) | PERSONELLER | MÜŞTERİLER */}
          <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOperationsSubTab('appointments')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  operationsSubTab === 'appointments'
                    ? 'bg-[#B86B35] text-white shadow-xs'
                    : 'bg-[#F8F6F0] text-stone-600 hover:text-stone-900'
                }`}
              >
                Canlı Randevular & Acil Müdahale ({salonAppointments.length})
              </button>

              <button
                onClick={() => setOperationsSubTab('staff')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  operationsSubTab === 'staff'
                    ? 'bg-[#B86B35] text-white shadow-xs'
                    : 'bg-[#F8F6F0] text-stone-600 hover:text-stone-900'
                }`}
              >
                Salon Personelleri ({salonStaff.length})
              </button>

              <button
                onClick={() => setOperationsSubTab('customers')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  operationsSubTab === 'customers'
                    ? 'bg-[#B86B35] text-white shadow-xs'
                    : 'bg-[#F8F6F0] text-stone-600 hover:text-stone-900'
                }`}
              >
                Müşteri Rehberi & Notları ({salonCustomers.length})
              </button>
            </div>
          </div>

          {/* 4. A.1: CANLI RANDEVULAR & ANINDA MÜDAHALE LİSTESİ */}
          {operationsSubTab === 'appointments' && (
            <div className="space-y-3">
              {/* Arama ve Durum Filtresi */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="bg-white border border-[#EBE7DF] rounded-2xl p-2 px-3 flex items-center gap-2 shadow-xs flex-1">
                  <Search className="w-4 h-4 text-stone-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Müşteri adı, telefonu veya usta adı ile anında bul..."
                    value={opSearchQuery}
                    onChange={(e) => setOpSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-stone-900 placeholder-stone-400 focus:outline-none"
                  />
                  {opSearchQuery && (
                    <button
                      onClick={() => setOpSearchQuery('')}
                      className="text-stone-400 hover:text-stone-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  {['all', 'confirmed', 'in_chair', 'completed', 'cancelled', 'no_show'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOpStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                        opStatusFilter === st
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-[#F8F6F0] text-stone-600 hover:text-stone-900 border border-[#EBE7DF]'
                      }`}
                    >
                      {st === 'all'
                        ? 'Tümü'
                        : st === 'confirmed'
                        ? 'Bekliyor'
                        : st === 'in_chair'
                        ? 'Koltukta'
                        : st === 'completed'
                        ? 'Tamamlandı'
                        : st === 'cancelled'
                        ? 'İptal'
                        : 'No-Show'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Randevu Tablosu */}
              <div className="bg-white border border-[#EBE7DF] rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8F6F0] text-stone-600 font-semibold border-b border-[#EBE7DF]/80 text-[11px]">
                      <tr>
                        <th className="py-3 px-4 font-bold">Saat / Tarih</th>
                        <th className="py-3 px-3 font-bold">Müşteri</th>
                        <th className="py-3 px-3 font-bold">Usta</th>
                        <th className="py-3 px-3 font-bold">Hizmet / Tutar</th>
                        <th className="py-3 px-3 font-bold">Durum</th>
                        <th className="py-3 px-4 text-right font-bold">Admin Acil Müdahale</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE7DF]/60 text-stone-700">
                      {filteredOpAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-stone-400 text-xs">
                            Kayıtlı randevu bulunamadı.
                          </td>
                        </tr>
                      ) : (
                        filteredOpAppointments.map((apt) => {
                          const isInChair = apt.status === 'in_chair';
                          const isCompleted = apt.status === 'completed';
                          const isCancelled = apt.status === 'cancelled';
                          const isNoShow = apt.status === 'no_show';

                          return (
                            <tr key={apt.id} className="hover:bg-stone-50/70 transition">
                              <td className="py-3.5 px-4 font-mono">
                                <div className="font-black text-stone-900 text-xs flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-[#B86B35]" />
                                  {apt.startTime}
                                </div>
                                <div className="text-[11px] text-stone-400">{apt.appointmentDate}</div>
                              </td>

                              <td className="py-3.5 px-3">
                                <div className="font-bold text-stone-900">{apt.customerName}</div>
                                <div className="text-[11px] text-stone-500 font-mono flex items-center gap-1.5 mt-0.5">
                                  <span>{apt.customerPhone}</span>
                                  <button
                                    onClick={() => openWhatsApp(apt.customerPhone, apt.customerName)}
                                    className="text-emerald-700 hover:text-emerald-900"
                                    title="WhatsApp'tan Yaz"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5 inline" />
                                  </button>
                                </div>
                                {apt.structuredTags && apt.structuredTags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {apt.structuredTags.slice(0, 2).map((t, idx) => (
                                      <span key={idx} className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded font-medium">
                                        🏷️ {t}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>

                              <td className="py-3.5 px-3">
                                <span className="font-bold text-stone-900 block">{apt.staffName || 'Usta'}</span>
                                <span className="text-[10px] text-stone-400">Atanmış Koltuk</span>
                              </td>

                              <td className="py-3.5 px-3">
                                <span className="font-medium text-stone-800 block">{apt.serviceName}</span>
                                <span className="font-black text-[#B86B35]">₺{apt.price}</span>
                              </td>

                              <td className="py-3.5 px-3">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                                    isInChair
                                      ? 'bg-[#FEF3C7] text-[#92400E] border border-amber-300'
                                      : isCompleted
                                      ? 'bg-[#E7F6EC] text-[#1B6E37] border border-emerald-300'
                                      : isCancelled
                                      ? 'bg-stone-200 text-stone-600'
                                      : isNoShow
                                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                      : 'bg-[#E0F2FE] text-[#0369A1] border border-blue-200'
                                  }`}
                                >
                                  {isInChair
                                    ? '🟣 Koltukta'
                                    : isCompleted
                                    ? '🟢 Tamamlandı'
                                    : isCancelled
                                    ? '⚪ İptal'
                                    : isNoShow
                                    ? '🔴 Gelmedi'
                                    : '🟡 Bekliyor'}
                                </span>
                              </td>

                              {/* HIZLI MÜDAHALE BUTONLARI */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditModal(apt)}
                                    className="bg-[#FAF3EE] hover:bg-[#B86B35]/20 text-[#B86B35] font-bold text-[11px] px-2.5 py-1.5 rounded-lg border border-[#B86B35]/30 transition shadow-2xs"
                                    title="Tarih, Usta veya Saat Değiştir"
                                  >
                                    ⚙️ Müdahale Et
                                  </button>

                                  {isCancelled ? (
                                    <button
                                      onClick={() =>
                                        onAdminUpdateAppointment(
                                          apt.id,
                                          { status: 'confirmed' },
                                          'Admin iptali geri aldı ve onayladı.'
                                        )
                                      }
                                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] px-2 py-1.5 rounded-lg transition"
                                    >
                                      ✓ Geri Aç
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        onAdminUpdateAppointment(
                                          apt.id,
                                          { status: 'cancelled' },
                                          'Admin randevuyu iptal etti.'
                                        )
                                      }
                                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] px-2 py-1.5 rounded-lg transition"
                                    >
                                      İptal
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. A.2: PERSONELLER (USTALAR) LİSTESİ */}
          {operationsSubTab === 'staff' && (
            <div className="bg-white border border-[#EBE7DF] rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F6F0] text-stone-600 font-semibold border-b border-[#EBE7DF]/80 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Usta Adı</th>
                    <th className="py-3 px-3 font-bold">Unvan</th>
                    <th className="py-3 px-3 font-bold">E-Posta / Telefon</th>
                    <th className="py-3 px-3 font-bold">İzinli Günler</th>
                    <th className="py-3 px-4 font-bold">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE7DF]/60 text-stone-700">
                  {salonStaff.map((st) => (
                    <tr key={st.id} className="hover:bg-stone-50/70 transition">
                      <td className="py-3.5 px-4 font-bold text-stone-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#B86B35] text-white flex items-center justify-center font-black text-xs">
                          {st.name.charAt(0)}
                        </div>
                        <span>{st.name}</span>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#B86B35]">{st.title}</td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-stone-500">
                        {st.email} • {st.phone}
                      </td>
                      <td className="py-3.5 px-3 text-[11px] text-stone-500">
                        {st.weeklyOffDays && st.weeklyOffDays.length > 0
                          ? `Haftalık: ${st.weeklyOffDays.map((d) => (d === 0 ? 'Paz' : 'Gün')).join(', ')}`
                          : 'Haftalık izin yok'}
                        {st.leaveDates && st.leaveDates.length > 0 && (
                          <span className="block text-rose-700 font-bold">
                            Özel İzin: {st.leaveDates.join(', ')}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-[#E7F6EC] text-[#1B6E37] px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. A.3: MÜŞTERİLER REHBERİ */}
          {operationsSubTab === 'customers' && (
            <div className="bg-white border border-[#EBE7DF] rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F6F0] text-stone-600 font-semibold border-b border-[#EBE7DF]/80 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Müşteri</th>
                    <th className="py-3 px-3 font-bold">Telefon</th>
                    <th className="py-3 px-3 font-bold">Sabit Usta Tercihi</th>
                    <th className="py-3 px-3 font-bold">Özel Kesim / Tercih Notu</th>
                    <th className="py-3 px-4 font-bold">Ziyaret Sayısı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE7DF]/60 text-stone-700">
                  {salonCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-stone-50/70 transition">
                      <td className="py-3.5 px-4 font-bold text-stone-900">{cust.name}</td>
                      <td className="py-3.5 px-3 font-mono text-stone-600">{cust.phone}</td>
                      <td className="py-3.5 px-3 font-bold text-[#B86B35]">
                        {cust.favoriteStaff ? `⭐ ${cust.favoriteStaff}` : 'Serbest'}
                      </td>
                      <td className="py-3.5 px-3 text-stone-600 italic">
                        {cust.specialNotes || 'Kayıtlı not yok.'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        {cust.totalVisits || 1} kez
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. B) İŞLEM GEÇMİŞİ (AUDIT LOG) & TEK TUŞLA GERİ ALMA (ROLLBACK)          */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#EBE7DF] rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#B86B35]" />
                <h3 className="font-black text-stone-900 text-base">Platform İşlem Denetim Kayıtları</h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Kim ne işlem yapmış saniye saniye izleyin. Hatalı bir işlem mi oldu? Tek tuşla anında geri alın!
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setAuditFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  auditFilter === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-[#F8F6F0] text-stone-600 hover:text-stone-900 border border-[#EBE7DF]'
                }`}
              >
                Tümü ({auditLogs.length})
              </button>

              <button
                onClick={() => setAuditFilter('appointment_cancel')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  auditFilter === 'appointment_cancel'
                    ? 'bg-rose-700 text-white'
                    : 'bg-[#F8F6F0] text-stone-600 hover:text-stone-900 border border-[#EBE7DF]'
                }`}
              >
                İptaller
              </button>

              <button
                onClick={() => setAuditFilter('status_change')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  auditFilter === 'status_change'
                    ? 'bg-[#B86B35] text-white'
                    : 'bg-[#F8F6F0] text-stone-600 hover:text-stone-900 border border-[#EBE7DF]'
                }`}
              >
                Durum Değişiklikleri
              </button>
            </div>
          </div>

          {/* Log Kartları Akışı */}
          <div className="space-y-3">
            {auditLogs
              .filter((log) => (auditFilter === 'all' ? true : log.action === auditFilter))
              .map((log) => {
                const isRollback = log.action === 'rollback';
                const isCancel = log.action === 'appointment_cancel';
                const canRollback = log.previousState && !log.isReversed && !isRollback;

                const timeFormatted = new Date(log.timestamp).toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });
                const dateFormatted = new Date(log.timestamp).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                });

                return (
                  <div
                    key={log.id}
                    className={`bg-white border rounded-2xl p-4 sm:p-5 transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      log.isReversed
                        ? 'border-stone-300 opacity-60 bg-stone-50'
                        : isRollback
                        ? 'border-emerald-300 bg-[#E7F6EC]/30'
                        : isCancel
                        ? 'border-rose-200'
                        : 'border-[#EBE7DF] hover:border-stone-400'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-500 bg-[#F8F6F0] px-2 py-0.5 rounded-md border border-[#EBE7DF]">
                          {dateFormatted} {timeFormatted}
                        </span>

                        <span className="text-xs font-black text-stone-900 flex items-center gap-1">
                          👤 {log.actorName}
                        </span>

                        <span className="text-stone-300">•</span>

                        <span className="text-xs font-bold text-[#B86B35]">
                          💈 {log.salonName}
                        </span>

                        {log.isReversed && (
                          <span className="text-[10px] font-black bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full">
                            ↩️ Bu İşlem Geri Alındı
                          </span>
                        )}

                        {isRollback && (
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                            ✓ Geri Alma Kaydı
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-stone-800 font-medium">
                        {log.description}
                      </div>

                      {/* Önceki vs Yeni Durum Özeti */}
                      {log.previousState && log.newState && (
                        <div className="flex items-center gap-2 text-[11px] pt-1">
                          <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-600 font-mono">
                            Eski: {JSON.stringify(log.previousState)}
                          </span>
                          <span className="text-stone-400">➡️</span>
                          <span className="bg-[#FAF3EE] text-[#B86B35] font-bold px-2 py-0.5 rounded font-mono">
                            Yeni: {JSON.stringify(log.newState)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* TEK TUŞLA GERİ AL BUTONU */}
                    <div>
                      {canRollback ? (
                        <button
                          type="button"
                          onClick={() => onRollbackAuditLog(log.id)}
                          className="w-full md:w-auto min-h-[44px] px-4 py-2 rounded-xl bg-[#FAF3EE] hover:bg-[#B86B35] hover:text-white text-[#B86B35] border border-[#B86B35]/40 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                        >
                          <Undo2 className="w-4 h-4" />
                          <span>Tek Tuşla Geri Al</span>
                        </button>
                      ) : log.isReversed ? (
                        <span className="text-xs text-stone-400 font-bold italic">
                          Zaten Geri Alındı
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. C) SALONLAR YÖNETİMİ (SPLIT DÜZENİ)                                    */}
      {/* ========================================================================= */}
      {activeTab === 'salons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
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
                      <th className="py-3 px-3 font-normal">Personel</th>
                      <th className="py-3 px-3 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE7DF]/60 text-stone-700">
                    {salons
                      .filter(
                        (s) =>
                          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.district.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((salon) => {
                        const isSelected = selectedSalonId === salon.id;
                        const sStaff = staffList.filter((st) => !st.salonId || st.salonId === salon.id);
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
                            <td className="py-3.5 px-3 text-stone-600 font-bold">
                              {sStaff.length} Usta
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onImpersonateSalon(salon.id);
                                }}
                                className="text-[11px] font-bold text-[#B86B35] hover:underline"
                              >
                                Canlı Yönet
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sağ: Seçili Salon Detayı */}
          {selectedSalon && (
            <div className="bg-white border border-[#EBE7DF] rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">{selectedSalon.name}</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {selectedSalon.district}, {selectedSalon.city} · {selectedSalon.phone}
                </p>
                <p className="text-[11px] text-stone-400 mt-1">{selectedSalon.address}</p>
              </div>

              <div className="pt-2 border-t border-[#EBE7DF]/70">
                <button
                  type="button"
                  onClick={() => onImpersonateSalon(selectedSalon.id)}
                  className="w-full py-2.5 rounded-xl bg-[#B86B35] hover:bg-[#A35C2B] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Bu Salon Olarak Giriş Yap</span>
                </button>
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
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. D) SİSTEM YÖNETİCİLERİ                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'admins' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EBE7DF] shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Platform Sistem Yöneticileri</h3>
              <p className="text-xs text-stone-500">
                Bu listedeki kişiler yönetim paneline tam yetkiyle erişebilir ve salonları denetleyebilir.
              </p>
            </div>

            <button
              onClick={() => setShowAddAdminModal(true)}
              className="px-4 py-2 rounded-xl bg-[#B86B35] hover:bg-[#A35C2B] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-4 h-4" /> Yeni Admin Ekle
            </button>
          </div>

          <div className="bg-white border border-[#EBE7DF] rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F6F0] text-stone-600 font-semibold border-b border-[#EBE7DF]">
                <tr>
                  <th className="p-4">Admin Adı</th>
                  <th className="p-4">E-Posta Adresi</th>
                  <th className="p-4">Yetki Derecesi</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE7DF] text-stone-700">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-stone-50/80 transition">
                    <td className="p-4 font-bold text-stone-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                        {admin.name.charAt(0)}
                      </div>
                      <span>{admin.name}</span>
                    </td>
                    <td className="p-4 font-mono text-stone-600">{admin.email}</td>
                    <td className="p-4">
                      {admin.isPrimary ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                          <Crown className="w-3 h-3" /> Kurucu Süper Admin
                        </span>
                      ) : (
                        <span className="bg-stone-100 text-stone-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Sistem Yöneticisi
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-emerald-700 font-bold bg-[#E7F6EC] px-2 py-0.5 rounded-full text-[10px]">
                        Aktif
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {!admin.isPrimary && (
                        <button
                          onClick={() => onDeleteAdmin(admin.id)}
                          className="text-rose-600 hover:text-rose-800 font-bold text-xs"
                        >
                          Sil
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. E) ALTYAPI & SAĞLIK (DATABASE)                                         */}
      {/* ========================================================================= */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#EBE7DF] rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-stone-500 font-bold uppercase tracking-wider block">Veritabanı</span>
              <div className="text-xl font-black text-stone-900 mt-1">Supabase Canlı PostgreSQL</div>
              <div className="text-xs text-emerald-700 font-bold mt-1">● Bağlı & Sağlıklı</div>
            </div>

            <div className="bg-white border border-[#EBE7DF] rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-stone-500 font-bold uppercase tracking-wider block">Toplam Kayıt</span>
              <div className="text-xl font-black text-[#B86B35] mt-1">{totalRecordsCount} Satır</div>
              <div className="text-xs text-stone-400 mt-1">Randevu, Müşteri, Personel, Audit</div>
            </div>

            <div className="bg-white border border-[#EBE7DF] rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-stone-500 font-bold uppercase tracking-wider block">Doluluk Oranı</span>
              <div className="text-xl font-black text-stone-900 mt-1">%{storagePercentage}</div>
              <div className="text-xs text-stone-400 mt-1">{usedStorageMB} MB / {maxStorageMB} MB</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ACİL MÜDAHALE MODALI (TARİH / SAAT / USTA DEĞİŞTİRME)                   */}
      {/* ========================================================================= */}
      {editingApt && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#B86B35] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-stone-900">
            <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3">
              <div>
                <span className="text-[10px] font-black text-[#B86B35] uppercase tracking-wider block">
                  Süper Admin Canlı Müdahale
                </span>
                <h3 className="text-lg font-black text-stone-900">
                  {editingApt.customerName} Randevusu
                </h3>
              </div>
              <button
                onClick={() => setEditingApt(null)}
                className="text-stone-400 hover:text-stone-800 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveIntervention} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Personel / Usta Değiştir *</label>
                <select
                  value={editStaffId}
                  onChange={(e) => setEditStaffId(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2.5 text-stone-900 font-bold focus:outline-none focus:border-[#B86B35] min-h-[44px]"
                >
                  {salonStaff.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.title})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Randevu Tarihi *</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-none focus:border-[#B86B35] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Saat *</label>
                  <input
                    type="time"
                    required
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2 text-stone-900 font-mono font-bold focus:outline-none focus:border-[#B86B35] min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Randevu Durumu *</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Appointment['status'])}
                  className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-none focus:border-[#B86B35] min-h-[44px]"
                >
                  <option value="confirmed">🟡 Onaylı / Bekliyor</option>
                  <option value="in_chair">🟣 Koltukta (İşlem Başladı)</option>
                  <option value="completed">🟢 Tamamlandı</option>
                  <option value="no_show">🔴 Gelmedi (No-Show)</option>
                  <option value="cancelled">⚪ İptal Edildi</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Müdahale Nedeni / Audit Notu *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Müşteri telefonla aradı saatini kaydırdı..."
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-[#B86B35] min-h-[44px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingApt(null)}
                  className="flex-1 min-h-[44px] rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-[#B86B35] hover:bg-[#A35C2B] text-white font-black transition shadow-xs"
                >
                  Kaydet & Müdahale Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YENİ SALON EKLEME MODALI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE7DF] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl text-stone-900">
            <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3">
              <h3 className="font-black text-stone-900 text-base">Yeni Salon Tanımla</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-800 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSalon} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Salon Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Karizma Kuaför"
                  value={newSalonName}
                  onChange={(e) => setNewSalonName(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Web Bağlantı Adresi (Slug) *</label>
                <input
                  type="text"
                  required
                  placeholder="karizma-kuafor"
                  value={newSalonSlug}
                  onChange={(e) => setNewSalonSlug(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">İl *</label>
                  <input
                    type="text"
                    required
                    value={newSalonCity}
                    onChange={(e) => setNewSalonCity(e.target.value)}
                    className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">İlçe *</label>
                  <input
                    type="text"
                    required
                    value={newSalonDistrict}
                    onChange={(e) => setNewSalonDistrict(e.target.value)}
                    className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Açık Adres *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Atatürk Caddesi No: 45/A"
                  value={newSalonAddress}
                  onChange={(e) => setNewSalonAddress(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2 min-h-[44px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 min-h-[44px] rounded-xl bg-stone-100 text-stone-700 font-bold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-[#B86B35] hover:bg-[#A35C2B] text-white font-bold"
                >
                  Salonu Aç
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YENİ ADMİN EKLEME MODALI */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE7DF] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl text-stone-900">
            <div className="flex items-center justify-between border-b border-[#EBE7DF] pb-3">
              <h3 className="font-black text-stone-900 text-base">Yeni Sistem Yöneticisi Tanımla</h3>
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="text-stone-400 hover:text-stone-800 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">E-Posta Adresi *</label>
                <input
                  type="email"
                  required
                  placeholder="ahmet@gmail.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full bg-[#F8F6F0] border border-[#EBE7DF] rounded-xl px-3 py-2 min-h-[44px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="flex-1 min-h-[44px] rounded-xl bg-stone-100 text-stone-700 font-bold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-[#B86B35] hover:bg-[#A35C2B] text-white font-bold"
                >
                  Yöneticiyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
