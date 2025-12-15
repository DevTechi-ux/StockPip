import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { executeQuery } from '@/lib/mysql';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    console.log('🔐 Admin login attempt:', { email, hasPassword: !!password });
    
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    // Check users table for admin users (user_type = 'admin')
    // This is the main table for admin users in forex_final database
    let result = await executeQuery(
      "SELECT id, email, password, CONCAT(first_name, ' ', last_name) AS name, is_active FROM users WHERE email = ? AND user_type = 'admin' LIMIT 1",
      [email]
    );

    console.log('📊 Users table query result:', { 
      success: result.success, 
      found: Array.isArray(result.data) ? result.data.length : 0 
    });

    if (!result.success) {
      console.error('❌ Database query failed:', result.error);
      return NextResponse.json({ 
        success: false, 
        message: 'Database error. Please check server logs.' 
      }, { status: 500 });
    }

    if (!Array.isArray(result.data) || result.data.length === 0) {
      console.log('❌ No admin user found with email:', email);
      // List available admin emails for debugging
      const allAdmins = await executeQuery(
        "SELECT email FROM users WHERE user_type = 'admin' LIMIT 5"
      );
      if (allAdmins.success && Array.isArray(allAdmins.data)) {
        console.log('📋 Available admin emails:', allAdmins.data.map((a: any) => a.email));
      }
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid email or password. Please check your credentials.' 
      }, { status: 401 });
    }

    const admin = result.data[0] as any;
    console.log('👤 Admin user found:', { 
      id: admin.id, 
      email: admin.email, 
      name: admin.name,
      is_active: admin.is_active 
    });

    if (admin.is_active === 0 || admin.is_active === false) {
      console.log('⚠️ Admin account is disabled');
      return NextResponse.json({ success: false, message: 'Account disabled. Please contact administrator.' }, { status: 403 });
    }

    if (!admin.password) {
      console.error('❌ Admin password field is empty');
      return NextResponse.json({ 
        success: false, 
        message: 'Account configuration error. Please reset password.' 
      }, { status: 500 });
    }

    const matches = await bcrypt.compare(String(password), String(admin.password));
    console.log('🔍 Password verification:', matches ? '✅ PASSED' : '❌ FAILED');
    
    if (!matches) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid email or password. Please check your credentials.' 
      }, { status: 401 });
    }

    // Return minimal session payload; UI stores in localStorage
    const token = `adm_${crypto.randomUUID()}`;
    console.log('✅ Admin login successful:', { email: admin.email, id: admin.id });
    
    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name || 'Administrator',
        role: 'admin'
      }
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('❌ Admin login error:', errorMessage);
    console.error('Full error:', err);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error. Please check server logs for details.',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}


