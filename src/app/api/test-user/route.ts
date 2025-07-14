import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();
    
    console.log('Testing user creation with:', { email, name });
    
    // Try to find existing user
    let user = await prisma.user.findFirst({
      where: { email: email }
    });

    if (!user) {
      console.log('Creating new user');
      user = await prisma.user.create({
        data: {
          email: email,
          name: name || 'Test User',
        }
      });
      console.log('Created user:', user.id);
    } else {
      console.log('Found existing user:', user.id);
    }

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, name: user.name } 
    });
  } catch (error) {
    console.error('Error in test user creation:', error);
    return NextResponse.json(
      { error: 'Failed to create/find user: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 