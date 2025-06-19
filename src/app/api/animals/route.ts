import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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