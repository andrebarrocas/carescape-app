import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return new NextResponse('Image ID is required', { status: 400 });
    }

    const image = await prisma.mediaUpload.findUnique({
      where: { id },
      select: {
        data: true,
        mimetype: true,
        type: true,
        caption: true
      }
    });

    if (!image || !image.data) {
      console.error('Image not found:', id);
      return new NextResponse('Image not found', { status: 404 });
    }

    // Return the image data with appropriate content type and caching headers
    return new NextResponse(image.data, {
      headers: {
        'Content-Type': image.mimetype || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': image.data.length.toString()
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
} 