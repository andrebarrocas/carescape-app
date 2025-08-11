import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear the custom auth-token cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 0, // This expires the cookie immediately
      path: '/',
    });

    // Also try to clear any other potential auth cookies
    response.cookies.set('next-auth.session-token', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('next-auth.csrf-token', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
