import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const animals = await prisma.animal.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return new NextResponse(JSON.stringify(animals), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching animals:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch animals' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const data = await request.json();
    const animal = await prisma.animal.create({
      data: {
        ...data,
        coordinates: JSON.stringify(data.coordinates),
        userId: session.user.id,
      },
    });

    return new NextResponse(JSON.stringify(animal), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating animal:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create animal' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 