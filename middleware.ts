import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect both /admin and /admin-v2 routes
  if ((pathname.startsWith('/admin') || pathname.startsWith('/admin-v2')) && pathname !== '/admin/login') {
    // Get auth token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const supabaseAdmin = getSupabaseAdmin();
      // Verify token and check if user is admin
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

      if (userError || !userData.user) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Check if user is in admin_users table
      const { data: adminUser, error: adminError } = await supabaseAdmin
        .from('admin_users')
        .select('id')
        .eq('id', userData.user.id)
        .single();

      if (adminError || !adminUser) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin-v2/:path*'],
};
