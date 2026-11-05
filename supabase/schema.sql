-- ==============================================================================
-- BERBER SAAS - SUPABASE POSTGRESQL VERİTABANI ŞEMASI
-- ==============================================================================

-- 1. UUID & Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SALONLAR / İŞLETMELER
CREATE TABLE IF NOT EXISTS public.salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    owner_email VARCHAR(255),
    phone VARCHAR(20),
    city VARCHAR(100) DEFAULT 'İstanbul',
    district VARCHAR(100) DEFAULT 'Kadıköy',
    address TEXT,
    logo_url TEXT,
    -- Otomasyon Ayarları:
    auto_confirm BOOLEAN DEFAULT true,     -- Yeni randevular anında otomatik onaylansın mı?
    auto_complete BOOLEAN DEFAULT true,    -- Süresi geçen randevular otomatik tamamlansın mı?
    -- SaaS Durumu:
    is_active BOOLEAN DEFAULT true,
    subscription_status VARCHAR(50) DEFAULT 'trial', -- 'trial', 'active', 'past_due', 'cancelled'
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PERSONEL / USTALAR / KOLTUKLAR
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(100) DEFAULT 'Kuaför & Berber Ustası',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. HİZMETLER (Fiyat opsiyonel / 0 TL olabilir)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30, -- 15, 30, 45, 60 dk vb.
    price DECIMAL(10,2) DEFAULT 0.00,             -- İsterse 0 TL bırakabilir
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ÇALIŞMA SAATLERİ & MOLA DÜZENİ
CREATE TABLE IF NOT EXISTS public.working_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0: Pazar, 1: Pazartesi ... 6: Cumartesi
    start_time TIME NOT NULL DEFAULT '09:00:00',
    end_time TIME NOT NULL DEFAULT '20:00:00',
    break_start TIME DEFAULT '13:00:00',
    break_end TIME DEFAULT '14:00:00',
    is_closed BOOLEAN DEFAULT false,
    UNIQUE(salon_id, day_of_week)
);

-- 6. RANDEVULAR
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'confirmed', -- 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'
    fcm_token TEXT,                         -- Mobil push bildirim token'ı
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. SAAS ABONELİKLERİ (Admin Takibi İçin)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) DEFAULT 'Pro Salon',
    monthly_price DECIMAL(10,2) DEFAULT 500.00,
    status VARCHAR(50) DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. SÜPER ADMİNLER & YÖNETİCİLER
CREATE TABLE IF NOT EXISTS public.system_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İlk Kurucu Süper Admin (Salih Yıldız)
INSERT INTO public.system_admins (email, name, is_primary, is_active)
VALUES ('yldzsalih27@gmail.com', 'Salih Yıldız', true, true)
ON CONFLICT (email) DO NOTHING;

-- İndeksler (Hızlı sorgulama ve çakışma kontrolü için)
CREATE INDEX IF NOT EXISTS idx_appointments_salon_date ON public.appointments(salon_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_date ON public.appointments(staff_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_salons_slug ON public.salons(slug);
