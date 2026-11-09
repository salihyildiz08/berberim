export type UserRole = 'admin' | 'barber_owner' | 'barber_staff' | 'customer';

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  role: UserRole;
  salonId?: string;
  staffId?: string;
  recurringDays?: number; // Otomatik periyodik tıraş döngüsü (örn: 20 gün)
}

export interface Salon {
  id: string;
  name: string;
  slug: string;
  ownerEmail?: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  logoUrl?: string;
  autoConfirm: boolean;
  autoComplete: boolean;
  isActive: boolean;
  subscriptionStatus: 'trial' | 'active' | 'past_due' | 'cancelled';
  trialEndsAt?: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  salonId: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  isActive: boolean;
  commissionRate?: number;
  weeklyOffDays?: number[]; // [0: Pazar, 1: Pazartesi ... 6: Cumartesi]
  leaveDates?: string[];    // İzinli/gelmediği tarihler (YYYY-MM-DD)
}

export interface Service {
  id: string;
  salonId: string;
  name: string;
  durationMinutes: number;
  price: number;
  description?: string;
  isActive: boolean;
}

export interface WorkingHours {
  id: string;
  salonId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  isClosed: boolean;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_chair' | 'completed' | 'cancelled' | 'break';

export interface Appointment {
  id: string;
  salonId: string;
  staffId: string;
  staffName?: string;
  serviceId: string;
  serviceName?: string;
  customerName: string;
  customerPhone: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string;       // HH:mm
  endTime: string;         // HH:mm
  price: number;
  status: AppointmentStatus;
  fcmToken?: string;
  notes?: string;
  visitCount?: number;
  recurringDays?: number;  // Otomatik döngü varsa (örn: 20)
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  salonId: string;
  name: string;
  phone: string;
  totalVisits: number;
  lastVisitDate: string;
  favoriteService?: string;
  favoriteStaff?: string; // Atanan Personel Adı
  assignedStaffId?: string; // Atanan Personel ID'si
  specialNotes?: string;
  recurringDays?: number;  // Müşterinin periyodik döngü tercihi
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface SystemAdmin {
  id: string;
  email: string;
  name: string;
  isPrimary?: boolean;
  isActive: boolean;
  createdAt: string;
}
