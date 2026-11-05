import { NextResponse } from 'next/server';
import { initialAppointments, initialWorkingHours, calculateAvailableSlots } from '@/lib/dataStore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const staffId = searchParams.get('staffId');
  const dateStr = searchParams.get('date'); // YYYY-MM-DD
  const duration = parseInt(searchParams.get('duration') || '30', 10);

  if (!staffId || !dateStr) {
    return NextResponse.json({ error: 'staffId ve date zorunludur.' }, { status: 400 });
  }

  const slots = calculateAvailableSlots(staffId, dateStr, duration, initialAppointments, initialWorkingHours);

  return NextResponse.json({
    success: true,
    data: {
      staffId,
      date: dateStr,
      durationMinutes: duration,
      slots,
    },
  });
}
