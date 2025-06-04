import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const image = await prisma.mediaUpload.findUnique({
      where: { id: params.id },
    });

    if (!image) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Convert the Bytes to Buffer
    const buffer = Buffer.from(image.data);

    // Return the image with proper content type
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': image.mimetype,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Error serving image', { status: 500 });
  }
} 