import { Salon, Staff, Service, WorkingHours, Appointment, TimeSlot, CustomerProfile } from '@/types';

export const initialSalon: Salon = {
  id: 'salon-1',
  name: 'Atelier de Coupe • Erkek Kuaförlüğü',
  slug: 'atelier-de-coupe',
  ownerEmail: 'mehmet@salonkarizma.com',
  phone: '0216 444 88 99',
  city: 'İstanbul',
  district: 'Kadıköy',
  address: 'Bağdat Caddesi No: 342/B, Suadiye',
  autoConfirm: true,
  autoComplete: true,
  isActive: true,
  subscriptionStatus: 'active',
  createdAt: '2026-01-15T10:00:00Z',
};

export const initialStaff: Staff[] = [
  {
    id: 'staff-1',
    salonId: 'salon-1',
    name: 'Murat Can',
    title: 'Master Barber / Stil Direktörü',
    email: 'murat@salonkarizma.com',
    phone: '0532 999 11 22',
    isActive: true,
    commissionRate: 50,
  },
  {
    id: 'staff-2',
    salonId: 'salon-1',
    name: 'Emre Yıldız',
    title: 'Senior Barber / Sakal Uzmanı',
    email: 'emre@salonkarizma.com',
    phone: '0533 888 33 44',
    isActive: true,
    commissionRate: 40,
  },
  {
    id: 'staff-3',
    salonId: 'salon-1',
    name: 'Tolga Demir',
    title: 'Barber & Saç Tasarım',
    email: 'tolga@salonkarizma.com',
    phone: '0535 777 55 66',
    isActive: true,
    commissionRate: 40,
  },
];

export const initialServices: Service[] = [
  { id: 'srv-1', salonId: 'salon-1', name: 'İmza Saç Kesimi & Yıkama', durationMinutes: 45, price: 450, description: 'Yüz tipine özel kesim analizi, saç yıkama ve stil fönü.', isActive: true },
  { id: 'srv-2', salonId: 'salon-1', name: 'Klasik Sıcak Havlu Sakal Tıraşı', durationMinutes: 30, price: 250, description: 'Ustura tıraşı, okaliptüslü sıcak havlu kompresi ve canlandırıcı losyon.', isActive: true },
  { id: 'srv-3', salonId: 'salon-1', name: 'Grand Ritüel (Saç + Sakal + Cilt)', durationMinutes: 75, price: 850, description: 'Saç kesimi, sakal tasarımı, siyah nokta temizliği ve canlandırıcı maske.', isActive: true },
  { id: 'srv-4', salonId: 'salon-1', name: 'Saç Boyama & Gri Kamuflaj', durationMinutes: 45, price: 0, description: 'Doğal görünümlü beyaz kırma ve tonlama işlemi (Fiyat dükkanda belirlenir).', isActive: true },
];

export const initialWorkingHours: WorkingHours[] = [
  { id: 'wh-1', salonId: 'salon-1', dayOfWeek: 1, startTime: '09:00', endTime: '21:00', breakStart: '13:00', breakEnd: '14:00', isClosed: false },
  { id: 'wh-2', salonId: 'salon-1', dayOfWeek: 2, startTime: '09:00', endTime: '21:00', breakStart: '13:00', breakEnd: '14:00', isClosed: false },
  { id: 'wh-3', salonId: 'salon-1', dayOfWeek: 3, startTime: '09:00', endTime: '21:00', breakStart: '13:00', breakEnd: '14:00', isClosed: false },
  { id: 'wh-4', salonId: 'salon-1', dayOfWeek: 4, startTime: '09:00', endTime: '21:00', breakStart: '13:00', breakEnd: '14:00', isClosed: false },
  { id: 'wh-5', salonId: 'salon-1', dayOfWeek: 5, startTime: '09:00', endTime: '21:00', breakStart: '13:00', breakEnd: '14:00', isClosed: false },
  { id: 'wh-6', salonId: 'salon-1', dayOfWeek: 6, startTime: '09:00', endTime: '21:00', breakStart: '13:00', breakEnd: '14:00', isClosed: false },
  { id: 'wh-0', salonId: 'salon-1', dayOfWeek: 0, startTime: '10:00', endTime: '18:00', isClosed: true },
];

export const getTodayStr = () => new Date().toISOString().split('T')[0];

export const initialAppointments: Appointment[] = [
  {
    id: 'apt-1',
    salonId: 'salon-1',
    staffId: 'staff-1',
    staffName: 'Murat Can',
    serviceId: 'srv-1',
    serviceName: 'İmza Saç Kesimi & Yıkama',
    customerName: 'Bora Aksoy',
    customerPhone: '0532 111 22 33',
    appointmentDate: getTodayStr(),
    startTime: '10:00',
    endTime: '10:45',
    price: 450,
    status: 'completed',
    visitCount: 6,
    notes: 'Ense sıfır değil, doğal bırakılsın.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt-2',
    salonId: 'salon-1',
    staffId: 'staff-1',
    staffName: 'Murat Can',
    serviceId: 'srv-3',
    serviceName: 'Grand Ritüel (Saç + Sakal + Cilt)',
    customerName: 'Ahmet Karahan',
    customerPhone: '0542 333 44 55',
    appointmentDate: getTodayStr(),
    startTime: '13:30',
    endTime: '14:45',
    price: 850,
    status: 'in_chair',
    visitCount: 3,
    notes: 'Toplantı öncesi acil kesim',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt-3',
    salonId: 'salon-1',
    staffId: 'staff-2',
    staffName: 'Emre Yıldız',
    serviceId: 'srv-2',
    serviceName: 'Klasik Sıcak Havlu Sakal Tıraşı',
    customerName: 'Levent Sezgin',
    customerPhone: '0555 777 88 99',
    appointmentDate: getTodayStr(),
    startTime: '11:00',
    endTime: '11:30',
    price: 250,
    status: 'completed',
    visitCount: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt-4',
    salonId: 'salon-1',
    staffId: 'staff-2',
    staffName: 'Emre Yıldız',
    serviceId: 'srv-1',
    serviceName: 'İmza Saç Kesimi & Yıkama',
    customerName: 'Volkan Aslan',
    customerPhone: '0533 444 55 66',
    appointmentDate: getTodayStr(),
    startTime: '15:00',
    endTime: '15:45',
    price: 450,
    status: 'confirmed',
    visitCount: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt-5',
    salonId: 'salon-1',
    staffId: 'staff-3',
    staffName: 'Tolga Demir',
    serviceId: 'srv-1',
    serviceName: 'İmza Saç Kesimi & Yıkama',
    customerName: 'Kaan Vural',
    customerPhone: '0533 999 00 11',
    appointmentDate: getTodayStr(),
    startTime: '16:00',
    endTime: '16:45',
    price: 450,
    status: 'confirmed',
    visitCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt-6',
    salonId: 'salon-1',
    staffId: 'staff-1',
    staffName: 'Murat Can',
    serviceId: 'srv-1',
    serviceName: 'Mola / Koltuk Kilidi',
    customerName: '☕ Usta Öğle Molası',
    customerPhone: '-',
    appointmentDate: getTodayStr(),
    startTime: '12:00',
    endTime: '13:00',
    price: 0,
    status: 'break',
    createdAt: new Date().toISOString(),
  },
];

// Dükkan Müşteri Rehberi (CRM Verileri)
export const initialCustomers: CustomerProfile[] = [
  {
    id: 'cust-1',
    salonId: 'salon-1',
    name: 'Bora Aksoy',
    phone: '0532 111 22 33',
    totalVisits: 6,
    lastVisitDate: '2026-11-04',
    favoriteService: 'İmza Saç Kesimi & Yıkama',
    favoriteStaff: 'Murat Can',
    specialNotes: 'Ense sıfır değil, doğal bırakılsın. Yıkamada ılık su tercih eder.',
    createdAt: '2026-03-10',
  },
  {
    id: 'cust-2',
    salonId: 'salon-1',
    name: 'Ahmet Karahan',
    phone: '0542 333 44 55',
    totalVisits: 3,
    lastVisitDate: '2026-11-01',
    favoriteService: 'Grand Ritüel (Saç + Sakal + Cilt)',
    favoriteStaff: 'Murat Can',
    specialNotes: 'Favorileri kısa tutar, sakal çizgisi düz.',
    createdAt: '2026-06-15',
  },
  {
    id: 'cust-3',
    salonId: 'salon-1',
    name: 'Volkan Aslan',
    phone: '0533 444 55 66',
    totalVisits: 4,
    lastVisitDate: '2026-10-22',
    favoriteService: 'İmza Saç Kesimi & Yıkama',
    favoriteStaff: 'Emre Yıldız',
    specialNotes: 'Üstler makas, yanlar 3 numara.',
    createdAt: '2026-05-20',
  },
  {
    id: 'cust-4',
    salonId: 'salon-1',
    name: 'Kaan Vural',
    phone: '0533 999 00 11',
    totalVisits: 2,
    lastVisitDate: '2026-10-14',
    favoriteService: 'İmza Saç Kesimi & Yıkama',
    favoriteStaff: 'Tolga Demir',
    specialNotes: 'Sıcak fön sevmez, wax yerine deniz tuzu spreyi kullanın.',
    createdAt: '2026-08-01',
  },
  {
    id: 'cust-5',
    salonId: 'salon-1',
    name: 'Levent Sezgin',
    phone: '0555 777 88 99',
    totalVisits: 1,
    lastVisitDate: '2026-11-05',
    favoriteService: 'Klasik Sıcak Havlu Sakal Tıraşı',
    favoriteStaff: 'Emre Yıldız',
    specialNotes: 'Hassas cilt, ustura sonrasında alkolsüz balsam uygulayın.',
    createdAt: '2026-11-05',
  },
];

export function calculateAvailableSlots(
  staffId: string,
  dateStr: string,
  durationMinutes: number,
  allAppointments: Appointment[],
  workingHours: WorkingHours[]
): TimeSlot[] {
  const dateObj = new Date(dateStr);
  const dayOfWeek = dateObj.getDay();

  const wh = workingHours.find((w) => w.dayOfWeek === dayOfWeek) || {
    startTime: '09:00',
    endTime: '21:00',
    breakStart: '13:00',
    breakEnd: '14:00',
    isClosed: false,
  };

  if (wh.isClosed) return [];

  const slots: TimeSlot[] = [];
  const [startH, startM] = wh.startTime.split(':').map(Number);
  const [endH, endM] = wh.endTime.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  const breakStartMin = wh.breakStart ? wh.breakStart.split(':').map(Number)[0] * 60 + wh.breakStart.split(':').map(Number)[1] : -1;
  const breakEndMin = wh.breakEnd ? wh.breakEnd.split(':').map(Number)[0] * 60 + wh.breakEnd.split(':').map(Number)[1] : -1;

  const staffDayApts = allAppointments.filter(
    (a) => a.staffId === staffId && a.appointmentDate === dateStr && a.status !== 'cancelled'
  );

  for (let m = startMinutes; m + durationMinutes <= endMinutes; m += 15) {
    const slotStartMin = m;
    const slotEndMin = m + durationMinutes;

    const inBreak =
      breakStartMin !== -1 &&
      ((slotStartMin >= breakStartMin && slotStartMin < breakEndMin) ||
        (slotEndMin > breakStartMin && slotEndMin <= breakEndMin) ||
        (slotStartMin <= breakStartMin && slotEndMin >= breakEndMin));

    if (inBreak) continue;

    const hasConflict = staffDayApts.some((apt) => {
      const [aptSh, aptSm] = apt.startTime.split(':').map(Number);
      const [aptEh, aptEm] = apt.endTime.split(':').map(Number);
      const aptStart = aptSh * 60 + aptSm;
      const aptEnd = aptEh * 60 + aptEm;

      return (
        (slotStartMin >= aptStart && slotStartMin < aptEnd) ||
        (slotEndMin > aptStart && slotEndMin <= aptEnd) ||
        (slotStartMin <= aptStart && slotEndMin >= aptEnd)
      );
    });

    const hh = String(Math.floor(slotStartMin / 60)).padStart(2, '0');
    const mm = String(slotStartMin % 60).padStart(2, '0');

    slots.push({
      time: `${hh}:${mm}`,
      available: !hasConflict,
    });
  }

  return slots;
}
