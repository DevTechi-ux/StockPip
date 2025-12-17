import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !body.password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    // Proxy to main Express backend login so the returned token is a JWT validated by the API
    const resp = await fetch(`${BACKEND}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok || !data.token) {
      return NextResponse.json({ success: false, message: data.message || 'Invalid admin credentials' }, { status: resp.status || 401 });
    }

    // Map backend user to admin payload expected by UI
    const admin = data.user ? { id: data.user.id, email: data.user.email, name: `${data.user.firstName || data.user.first_name || ''} ${data.user.lastName || data.user.last_name || ''}`.trim(), role: 'admin' } : { id: null, email, name: 'Administrator', role: 'admin' };

    return NextResponse.json({ success: true, token: data.token, admin });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('❌ Admin login proxy error:', errorMessage);
    return NextResponse.json({ success: false, message: 'Server error. Please check server logs.' }, { status: 500 });
  }
}


