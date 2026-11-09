'use client';

import React, { useState } from 'react';
import { CustomerProfile, Staff, Service } from '@/types';
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
} from 'lucide-react';

interface CustomerDirectoryProps {
  customers: CustomerProfile[];
  staffList: Staff[];
  services: Service[];
  onAddCustomer: (newCustomer: Omit<CustomerProfile, 'id' | 'createdAt'>) => void;
  onUpdateCustomerNote: (customerId: string, note: string) => void;
  onUpdateCustomerStaff?: (customerId: string, staffName: string, staffId?: string) => void;
}

export const CustomerDirectory: React.FC<CustomerDirectoryProps> = ({
  customers,
  staffList,
  services,
  onAddCustomer,
  onUpdateCustomerNote,
  onUpdateCustomerStaff,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  // Yeni Müşteri Modalı
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [favService, setFavService] = useState(services[0]?.name || '');
  const [favStaff, setFavStaff] = useState(staffList[0]?.name || '');
  const [specialNotes, setSpecialNotes] = useState('');

  // Not düzenleme modu
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const matchedStaff = staffList.find((s) => s.name === favStaff);

    onAddCustomer({
      salonId: 'salon-1',
      name,
      phone,
      totalVisits: 1,
      lastVisitDate: new Date().toISOString().split('T')[0],
      favoriteService: favService,
      favoriteStaff: favStaff,
      assignedStaffId: matchedStaff?.id,
      specialNotes,
    });

    setName('');
    setPhone('');
    setSpecialNotes('');
    setShowAddModal(false);
  };

  const handleSaveNote = (customerId: string) => {
    onUpdateCustomerNote(customerId, tempNote);
    setEditingNoteId(null);
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer({ ...selectedCustomer, specialNotes: tempNote });
    }
  };

  return (
    <div className="space-y-6">
      {/* ÜST ARAMA VE YENİ MÜŞTERİ BUTONU */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="İsim veya telefon numarası ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900"
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" /> Yeni Müşteri Kaydet
        </button>
      </div>

      {/* MÜŞTERİ LİSTESİ VE DETAY ÇİFT KOLON GÖRÜNÜMÜ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOL: Müşteri Kartları Listesi */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>Kayıtlı Müşteriler ({filteredCustomers.length})</span>
            <span>Sadakat & Notlar</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {filteredCustomers.map((cust) => {
              const isSelected = selectedCustomer?.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`bg-white border rounded-xl p-4 transition-all cursor-pointer flex items-start justify-between gap-4 shadow-xs ${
                    isSelected
                      ? 'border-slate-900 ring-1 ring-slate-900 bg-slate-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {cust.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{cust.name}</h4>
                        {cust.totalVisits >= 3 && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {cust.totalVisits}. Gelişi
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {cust.phone}
                      </p>

                      <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-3 flex-wrap">
                        {cust.favoriteStaff && (
                          <span>👤 Usta: <strong className="text-slate-800">{cust.favoriteStaff}</strong></span>
                        )}
                        {cust.favoriteService && (
                          <span>✂️ {cust.favoriteService}</span>
                        )}
                        <span>📅 Son Ziyaret: {cust.lastVisitDate}</span>
                      </div>

                      {cust.specialNotes && (
                        <div className="mt-2 text-xs bg-amber-50/60 text-amber-950 px-2.5 py-1 rounded-lg border border-amber-200/60 italic">
                          Berber Notu: "{cust.specialNotes}"
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
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SAĞ: Seçili Müşterinin Özel Not & Detay Kartı */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs sticky top-20 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Müşteri Profil Detayı
            </h3>

            {selectedCustomer ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-extrabold text-base flex items-center justify-center">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">{selectedCustomer.name}</h4>
                    <p className="text-slate-500 font-mono">{selectedCustomer.phone}</p>
                    <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-1">
                      Toplam {selectedCustomer.totalVisits} Tıraş Kaydı
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Atanan Usta / Personel:</span>
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
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900 shadow-2xs"
                    >
                      <option value="">-- Personel Seçimi (Fark Etmez) --</option>
                      {staffList.map((st) => (
                        <option key={st.id} value={st.name}>
                          ✂️ {st.name} ({st.title})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Sık Aldığı Hizmet:</span>
                    <span className="font-bold text-slate-900">{selectedCustomer.favoriteService || 'Klasik Kesim'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Son Tıraş Tarihi:</span>
                    <span className="font-bold text-slate-900">{selectedCustomer.lastVisitDate}</span>
                  </div>
                </div>

                {/* BERBER ÖZEL KESİM NOTU DÜZENLEME */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
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
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  ) : (
                    <p className="text-xs text-slate-700 bg-amber-50/80 border border-amber-200/80 p-3 rounded-lg italic">
                      {selectedCustomer.specialNotes || 'Bu müşteri için henüz özel kesim notu girilmedi.'}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      alert(`${selectedCustomer.name} için randevu oluşturma akışına yönlendiriliyorsunuz.`);
                    }}
                    className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Calendar className="w-4 h-4" /> Bu Müşteriye Randevu Yaz
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Detayları ve özel berber notlarını görmek için soldaki listeden bir müşteriye tıklayın.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* YENİ MÜŞTERİ EKLEME MODALI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Rehbere Yeni Müşteri Kaydet</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Müşteri Ad Soyad *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Selim Güneş"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Telefon Numarası *</label>
                <input
                  type="tel"
                  required
                  placeholder="0532 000 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Atanan Personel / Usta</label>
                  <select
                    value={favStaff}
                    onChange={(e) => setFavStaff(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 text-xs font-semibold"
                  >
                    <option value="">Fark Etmez / Serbest</option>
                    {staffList.map((st) => (
                      <option key={st.id} value={st.name}>✂️ {st.name} ({st.title})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Genel Tercihi</label>
                  <select
                    value={favService}
                    onChange={(e) => setFavService(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 text-xs"
                  >
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.name}>{srv.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Özel Kesim / Müşteri Notu</label>
                <textarea
                  rows={2}
                  placeholder="Örn: Ense natürel, favoriler uzun bırakılacak..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 text-xs"
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
                  className="flex-1 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-xs"
                >
                  Müşteriyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
