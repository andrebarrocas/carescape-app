import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Store in database without color relation (will be connected later)
    const mediaUpload = await prisma.mediaUpload.create({
      data: {
        filename: file.name,
        mimetype: file.type,
        type,
        data: buffer,
      } as any, // Temporarily cast to any to bypass type checking
    });

    // Return the media upload info
    return NextResponse.json({
      id: mediaUpload.id,
      filename: mediaUpload.filename,
      mimetype: mediaUpload.mimetype,
      type: mediaUpload.type,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 