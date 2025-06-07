import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface MediaUploadResult {
  id: string;
  filename: string;
  mimetype: string;
  type: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type') as string;

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await (file as Blob).arrayBuffer());

    // Create media upload using raw SQL
    const [mediaUpload] = await prisma.$queryRaw<MediaUploadResult[]>`
      INSERT INTO "media_uploads" ("id", "filename", "mimetype", "type", "data", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${(file as any).name}, ${(file as any).type}, ${type}, ${buffer}, NOW(), NOW())
      RETURNING "id", "filename", "mimetype", "type"
    `;

    // Return the media upload info
    return NextResponse.json(mediaUpload);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: `Error uploading file: ${error}` },
      { status: 500 }
    );
  }
} 