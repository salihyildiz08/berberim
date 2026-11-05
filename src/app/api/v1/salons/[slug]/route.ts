import { NextResponse } from 'next/server';
import { initialSalon, initialStaff, initialServices, initialWorkingHours } from '@/lib/dataStore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (slug !== initialSalon.slug) {
    return NextResponse.json({ error: 'Salon bulunamadı' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      salon: initialSalon,
      staff: initialStaff.filter((s) => s.isActive),
      services: initialServices.filter((s) => s.isActive),
      workingHours: initialWorkingHours,
    },
  });
}
