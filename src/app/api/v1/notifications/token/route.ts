import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token, role, userId, phone } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'FCM Token zorunludur' }, { status: 400 });
    }

    // Mobil cihazın FCM token'ı kaydedilir
    console.log(`[FCM REGISTER] Token alındı: ${token.substring(0, 15)}... Rol: ${role || 'customer'} Tel: ${phone || 'N/A'}`);

    return NextResponse.json({
      success: true,
      message: 'FCM Token başarıyla kaydedildi',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
