import { NextResponse } from 'next/server';
import { initialAppointments, initialSalon, initialStaff, initialServices } from '@/lib/dataStore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');
  const salonId = searchParams.get('salonId');

  let results = [...initialAppointments];

  if (phone) {
    results = results.filter((a) => a.customerPhone.replace(/\s+/g, '') === phone.replace(/\s+/g, ''));
  }
  if (salonId) {
    results = results.filter((a) => a.salonId === salonId);
  }

  return NextResponse.json({
    success: true,
    data: results,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { salonId, staffId, serviceId, customerName, customerPhone, appointmentDate, startTime, notes, fcmToken } = body;

    if (!salonId || !staffId || !serviceId || !customerName || !customerPhone || !appointmentDate || !startTime) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });
    }

    const service = initialServices.find((s) => s.id === serviceId);
    const staff = initialStaff.find((s) => s.id === staffId);

    const durationMinutes = service ? service.durationMinutes : 30;
    const [h, m] = startTime.split(':').map(Number);
    const totalMin = h * 60 + m + durationMinutes;
    const endH = String(Math.floor(totalMin / 60)).padStart(2, '0');
    const endM = String(totalMin % 60).padStart(2, '0');
    const endTime = `${endH}:${endM}`;

    // Berberin ayarına göre otomatik onay
    const status = initialSalon.autoConfirm ? 'confirmed' : 'pending';

    const newAppointment = {
      id: `apt-${Date.now()}`,
      salonId,
      staffId,
      staffName: staff?.name || 'Berber',
      serviceId,
      serviceName: service?.name || 'Hizmet',
      customerName,
      customerPhone,
      appointmentDate,
      startTime,
      endTime,
      price: service ? service.price : 0,
      status,
      fcmToken,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    // Arka planda Firebase Cloud Messaging (FCM) push bildirimi gönderme mantığı simülasyonu
    console.log(`[PUSH NOTIFICATION] Berbere bildirim: Yeni Randevu! ${customerName} - ${appointmentDate} ${startTime}`);
    if (fcmToken) {
      console.log(`[PUSH NOTIFICATION] Müşteriye bildirim: Randevunuz onaylandı! ${startTime}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Randevu başarıyla oluşturuldu',
      data: newAppointment,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Sunucu hatası' }, { status: 500 });
  }
}
