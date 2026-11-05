'use client';

import React, { useState, useEffect } from 'react';
import { UserRole, Salon, Staff, Service, Appointment, AuthUser, CustomerProfile } from '@/types';
import {
  initialSalon,
  initialStaff,
  initialServices,
  initialAppointments,
  initialCustomers,
} from '@/lib/dataStore';
import { AuthScreen } from '@/components/AuthScreen';
import { CustomerBooking } from '@/components/CustomerBooking';
import { BarberDashboard } from '@/components/BarberDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { NotificationToast, PushNotification } from '@/components/NotificationToast';
import {
  Scissors,
  User,
  ShieldCheck,
  Smartphone,
  LogOut,
  UserCheck,
  Bell,
} from 'lucide-react';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentView, setCurrentView] = useState<'admin' | 'barber' | 'customer'>('admin');

  const [salons, setSalons] = useState<Salon[]>([
    initialSalon,
    {
      id: 'salon-2',
      name: 'Gentlemen’s House • Nişantaşı',
      slug: 'gentlemens-house',
      ownerEmail: 'nisantasi@gentlemens.com',
      phone: '0212 234 56 78',
      city: 'İstanbul',
      district: 'Şişli',
      address: 'Teşvikiye Cad. No: 18, Nişantaşı',
      autoConfirm: true,
      autoComplete: true,
      isActive: true,
      subscriptionStatus: 'active',
      createdAt: '2026-02-01T10:00:00Z',
    },
  ]);

  const [activeSalon, setActiveSalon] = useState<Salon>(initialSalon);
  const [staffList, setStaffList] = useState<Staff[]>(initialStaff);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [customers, setCustomers] = useState<CustomerProfile[]>(initialCustomers);

  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [showApiDocs, setShowApiDocs] = useState<boolean>(false);
  const [nativeNotifStatus, setNativeNotifStatus] = useState<'default' | 'granted' | 'denied'>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNativeNotifStatus(Notification.permission);
    }
  }, []);

  const requestNativeNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNativeNotifStatus(permission);
      if (permission === 'granted') {
        new Notification('🔔 Banka Tarzı Bildirimler Aktif!', {
          body: 'Randevu hatırlatmaları, onaylar ve usta çağrıları artık telefon/bilgisayar kilit ekranınıza gelecek.',
        });
        addNotification('Cihaz Bildirimi Aktif', 'Banka standardında anlık push bildirim izni başarıyla verildi.');
      }
    }
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentView('admin');
      addNotification('SaaS Master Girişi', `Hoş geldiniz Salih Bey (Süper Admin). Tüm yetkiler aktif.`);
    } else if (user.role === 'barber_owner') {
      setCurrentView('barber');
      addNotification('Salon Sahibi Girişi', `Hoş geldiniz Mehmet Usta. Koltuk ajandası ve müşteri havuzu aktif.`);
    } else if (user.role === 'barber_staff') {
      setCurrentView('barber');
      addNotification('Personel Girişi', `Hoş geldiniz ${user.name}. Sadece kendi koltuğunuz ve randevularınız açıldı.`);
    } else {
      setCurrentView('customer');
      addNotification('Giriş Başarılı', `Hoş geldiniz ${user.name}. Randevu portalı açıldı.`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setNotifications([]);
  };

  const addNotification = (
    title: string,
    message: string,
    actions?: { label: string; action: () => void; variant?: 'success' | 'danger' }[]
  ) => {
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      actions,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 3)]);

    // Gerçek İşletim Sistemi / Telefon Kilit Ekranı Bildirimi (Banka Tarzı Native Push)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: 'https://cdn-icons-png.flaticon.com/512/2838/2838895.png',
        });
      } catch (err) {
        console.error('Push notification trigger error:', err);
      }
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    if (!activeSalon.autoComplete) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentTotalMin = currentH * 60 + currentM;

      setAppointments((prev) =>
        prev.map((apt) => {
          if (apt.status === 'confirmed' || apt.status === 'in_chair') {
            const [eh, em] = apt.endTime.split(':').map(Number);
            const endTotalMin = eh * 60 + em;
            if (currentTotalMin > endTotalMin) {
              return { ...apt, status: 'completed' };
            }
          }
          return apt;
        })
      );
    }, 30000);

    return () => clearInterval(interval);
  }, [activeSalon.autoComplete]);

  // Randevu alındığında müşteri rehberini de otomatik güncelle
  const handleBookAppointment = (newAptData: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newId = `apt-${Date.now()}`;
    const newApt: Appointment = {
      ...newAptData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setAppointments((prev) => [newApt, ...prev]);

    // Müşteri rehberinde var mı?
    setCustomers((prev) => {
      const existing = prev.find((c) => c.phone.replace(/\s+/g, '') === newApt.customerPhone.replace(/\s+/g, ''));
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                totalVisits: c.totalVisits + 1,
                lastVisitDate: newApt.appointmentDate,
                specialNotes: newApt.notes ? `${c.specialNotes || ''} • ${newApt.notes}` : c.specialNotes,
              }
            : c
        );
      } else {
        const newCust: CustomerProfile = {
          id: `cust-${Date.now()}`,
          salonId: activeSalon.id,
          name: newApt.customerName,
          phone: newApt.customerPhone,
          totalVisits: 1,
          lastVisitDate: newApt.appointmentDate,
          favoriteService: newApt.serviceName,
          favoriteStaff: newApt.staffName,
          specialNotes: newApt.notes || '',
          createdAt: new Date().toISOString().split('T')[0],
        };
        return [newCust, ...prev];
      }
    });

    addNotification(
      '💈 Yeni Randevu Kaydı',
      `${newApt.customerName}, ${newApt.appointmentDate} saat ${newApt.startTime} için "${newApt.serviceName}" randevusu aldı.`,
      currentUser?.role === 'admin'
        ? [
            {
              label: 'Ajandada Aç',
              action: () => setCurrentView('barber'),
            },
          ]
        : undefined
    );
  };

  const handleAddQuickAppointment = (newAptData: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newId = `apt-${Date.now()}`;
    const newApt: Appointment = {
      ...newAptData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setAppointments((prev) => [newApt, ...prev]);
    addNotification('Koltuk Güncellendi', `${newApt.customerName} için ajandaya kayıt eklendi.`);
  };

  const handleCancelAppointment = (aptId: string) => {
    const apt = appointments.find((a) => a.id === aptId);
    setAppointments((prev) =>
      prev.map((a) => (a.id === aptId ? { ...a, status: 'cancelled' } : a))
    );

    if (apt) {
      addNotification(
        'Randevu İptali',
        `${apt.customerName} adlı müşterinin ${apt.appointmentDate} ${apt.startTime} randevusu iptal edildi. Koltuk boşa çıktı.`
      );
    }
  };

  const handleAddCustomer = (newCustomerData: Omit<CustomerProfile, 'id' | 'createdAt'>) => {
    const created: CustomerProfile = {
      ...newCustomerData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [created, ...prev]);
    addNotification('Rehber Güncellendi', `${created.name} müşteri rehberine kaydedildi.`);
  };

  const handleUpdateCustomerNote = (customerId: string, note: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, specialNotes: note } : c))
    );
    addNotification('Not Kaydedildi', 'Müşteri kesim notu güncellendi.');
  };

  const handleUpdateSalonSettings = (settings: Partial<Salon>) => {
    setActiveSalon((prev) => ({ ...prev, ...settings }));
    setSalons((prev) => prev.map((s) => (s.id === activeSalon.id ? { ...s, ...settings } : s)));
    addNotification('Sistem Ayarı', 'Salon otomasyon parametreleri güncellendi.');
  };

  const handleAddService = (newSrv: Omit<Service, 'id' | 'salonId' | 'isActive'>) => {
    const created: Service = {
      ...newSrv,
      id: `srv-${Date.now()}`,
      salonId: activeSalon.id,
      isActive: true,
    };
    setServices((prev) => [...prev, created]);
    addNotification('Hizmet Eklendi', `"${created.name}" hizmet menüsüne eklendi.`);
  };

  const handleDeleteService = (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    addNotification('Hizmet Silindi', 'Hizmet kaldırıldı.');
  };

  const handleAddStaff = (name: string, title: string, email: string) => {
    const created: Staff = {
      id: `staff-${Date.now()}`,
      salonId: activeSalon.id,
      name,
      title,
      email,
      phone: '0532 000 00 00',
      isActive: true,
      commissionRate: 40,
    };
    setStaffList((prev) => [...prev, created]);
    addNotification('Personel Eklendi', `Personel "${name}" sisteme eklendi (Giriş: ${email}).`);
  };

  const handleDeleteStaff = (staffId: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    addNotification('Kadro Güncellendi', 'Stilist kadrodan çıkarıldı.');
  };

  const handleUpdateAppointmentStatus = (aptId: string, newStatus: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === aptId ? { ...a, status: newStatus } : a))
    );
    addNotification(
      'Durum Değişti',
      `Randevu durumu "${
        newStatus === 'completed'
          ? 'Tamamlandı'
          : newStatus === 'in_chair'
          ? 'Koltukta / Tıraş Başladı'
          : newStatus === 'cancelled'
          ? 'İptal'
          : 'Onaylı'
      }" yapıldı.`
    );
  };

  const handleToggleSalonStatus = (salonId: string) => {
    setSalons((prev) =>
      prev.map((s) => (s.id === salonId ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleAddSalon = (name: string, slug: string, phone: string) => {
    const newSalon: Salon = {
      id: `salon-${Date.now()}`,
      name,
      slug,
      phone,
      city: 'İstanbul',
      district: 'Kadıköy',
      address: 'Adres tanımlanmamış',
      autoConfirm: true,
      autoComplete: true,
      isActive: true,
      subscriptionStatus: 'active',
      createdAt: new Date().toISOString(),
    };
    setSalons((prev) => [...prev, newSalon]);
    addNotification('Yeni Tenant', `"${name}" salonu sisteme kaydedildi.`);
  };

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900">
      <NotificationToast notifications={notifications} onDismiss={dismissNotification} />

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 uppercase">
                  BERBERİM
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {currentUser.role === 'admin'
                    ? 'SÜPER ADMİN'
                    : currentUser.role === 'barber_owner'
                    ? 'SALON SAHİBİ (PATRON)'
                    : currentUser.role === 'barber_staff'
                    ? 'PERSONEL STİLİST'
                    : 'MÜŞTERİ'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">B2B Salon Rezervasyon & Koltuk Takip Çözümü</p>
            </div>
          </div>

          {/* SÜPER ADMİN GEÇİŞ SEKMELERİ */}
          {currentUser.role === 'admin' && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  currentView === 'admin'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> SaaS Master
              </button>

              <button
                onClick={() => setCurrentView('barber')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  currentView === 'barber'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" /> Berber Ajandası
              </button>

              <button
                onClick={() => setCurrentView('customer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  currentView === 'customer'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Müşteri Portalı
              </button>
            </div>
          )}

          {/* SAĞ KULLANICI BİLGİSİ VE ÇIKIŞ */}
          <div className="flex items-center gap-2.5">
            {nativeNotifStatus !== 'granted' ? (
              <button
                onClick={requestNativeNotification}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition"
                title="Banka tarzı gerçek cihaz bildirimlerini aktifleştir"
              >
                <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                <span className="hidden sm:inline">Banka Bildirimlerini Aç</span>
              </button>
            ) : (
              <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Push Aktif
              </span>
            )}

            <button
              onClick={() => setShowApiDocs(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobil API</span>
            </button>

            <div className="flex items-center gap-2.5 bg-slate-100 px-3 py-1.5 rounded-xl">
              <div className="w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500">{currentUser.email || currentUser.phone}</div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-1 p-1 text-slate-400 hover:text-rose-600 rounded transition"
                title="Çıkış Yap"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ANA İÇERİK ALANI */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {currentView === 'customer' && (
          <CustomerBooking
            currentUser={currentUser}
            salon={activeSalon}
            staffList={staffList}
            services={services}
            appointments={appointments}
            onBookAppointment={handleBookAppointment}
            onCancelAppointment={handleCancelAppointment}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'barber' && (
          <BarberDashboard
            currentUser={currentUser}
            salon={activeSalon}
            staffList={staffList}
            services={services}
            appointments={appointments}
            customers={customers}
            onUpdateSalonSettings={handleUpdateSalonSettings}
            onAddService={handleAddService}
            onDeleteService={handleDeleteService}
            onAddStaff={handleAddStaff}
            onDeleteStaff={handleDeleteStaff}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onAddQuickAppointment={handleAddQuickAppointment}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomerNote={handleUpdateCustomerNote}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            salons={salons}
            appointments={appointments}
            onToggleSalonStatus={handleToggleSalonStatus}
            onAddSalon={handleAddSalon}
          />
        )}
      </main>

      {/* MOBİL API DOKÜMANTASYON MODALI */}
      {showApiDocs && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-slate-900" />
                <h3 className="font-bold text-slate-900 text-base">Mobil Uygulama API Dokümantasyonu</h3>
              </div>
              <button
                onClick={() => setShowApiDocs(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Flutter veya React Native mobil uygulamanız için hazır REST API uç noktaları:
            </p>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-blue-700 font-bold">GET /api/v1/salons/{'{slug}'}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Salon profili, stilist listesi ve hizmet menüsü.</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-blue-700 font-bold">GET /api/v1/slots?staffId=...&date=YYYY-MM-DD&duration=45</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Seçilen tarihteki müsait slot matrisi.</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-emerald-700 font-bold">POST /api/v1/appointments</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Randevu oluşturur ve FCM bildirimini tetikler.</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-blue-700 font-bold">GET /api/v1/appointments?phone=...</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Müşteri randevu geçmişi.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-3.5 px-4 text-center text-[11px] text-slate-500">
        Berberim SaaS Platformu • Kurumsal Randevu & Koltuk Yönetim Sistemi
      </footer>
    </div>
  );
}
