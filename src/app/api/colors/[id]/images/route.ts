import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const colorId = params.id;

    const images = await prisma.mediaUpload.findMany({
      where: {
        colorId: colorId,
      },
      select: {
        id: true,
        filename: true,
        mimetype: true,
        type: true,
        data: true,
        caption: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to include binary data as base64 URLs
    const transformedImages = images.map((image) => ({
      id: image.id,
      url: `data:${image.mimetype};base64,${Buffer.from(image.data).toString('base64')}`,
      caption: image.caption,
      type: image.type,
    }));

    return NextResponse.json(transformedImages);
  } catch (error) {
    console.error('Error fetching color images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch color images' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: colorId } = await context.params;
  try {
    const formData = await request.formData();
    const files = formData.getAll('media') as File[];
    const captions = formData.getAll('captions') as string[];

    const uploads = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!(file instanceof File)) continue;
      const caption = captions[i] || '';
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const upload = await prisma.mediaUpload.create({
        data: {
          colorId,
          filename: file.name,
          mimetype: file.type,
          data: buffer,
          type: 'process',
          caption,
        },
        select: {
          id: true,
          filename: true,
          mimetype: true,
          type: true,
          caption: true,
        },
      });
      uploads.push(upload);
    }

    return NextResponse.json({ success: true, uploads });
  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
  }
} 