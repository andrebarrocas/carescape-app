import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface MediaUploadResult {
  id: string;
  filename: string;
  mimetype: string;
  type: string;
  caption?: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string;
    const caption = formData.get('caption') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read the file as ArrayBuffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create media upload using Prisma
    const mediaUpload = await prisma.mediaUpload.create({
      data: {
        filename: file.name,
        mimetype: file.type,
        type,
        data: buffer,
        caption: caption || undefined,
      },
      select: {
        id: true,
        filename: true,
        mimetype: true,
        type: true,
        caption: true,
      },
    });

    // Return the media upload info
    return NextResponse.json(mediaUpload);
  } catch (error) {
    console.error('Error uploading file:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
  }
} 