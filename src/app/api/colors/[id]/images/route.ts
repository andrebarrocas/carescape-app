import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: colorId } = await params;

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
    console.log('Media upload request received for colorId:', colorId);
    
    const formData = await request.formData();
    const files = formData.getAll('media') as File[];
    const captions = formData.getAll('captions') as string[];
    const types = formData.getAll('types') as string[];

    console.log('Files received:', files.length);
    console.log('Captions received:', captions.length);
    console.log('Types received:', types.length);

    if (files.length === 0) {
      console.error('No files received in the request');
      return NextResponse.json({ error: 'No files received' }, { status: 400 });
    }

    const uploads = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Processing file ${i + 1}:`, file.name, file.size, file.type);
      
      if (!(file instanceof File)) {
        console.error(`File ${i + 1} is not a valid File object:`, file);
        continue;
      }
      
      const caption = captions[i] || '';
      const type = types[i] || 'process'; // Default to process if no type specified
      
      console.log(`File ${i + 1} details:`, { name: file.name, type, caption });
      
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        console.log(`File ${i + 1} buffer size:`, buffer.length);

        const upload = await prisma.mediaUpload.create({
          data: {
            colorId,
            filename: file.name,
            mimetype: file.type,
            data: buffer,
            type: type,
            caption,
          },
          select: {
            id: true,
            filename: true,
            mimetype: true,
            type: true,
            caption: true,
            colorId: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        
        console.log(`File ${i + 1} uploaded successfully:`, upload.id);
        
        uploads.push({
          ...upload,
          comments: [],
          createdAt: upload.createdAt.toISOString(),
          updatedAt: upload.updatedAt.toISOString(),
        });
      } catch (fileError) {
        console.error(`Error processing file ${i + 1}:`, fileError);
        throw fileError;
      }
    }

    console.log('All files uploaded successfully. Total uploads:', uploads.length);
    return NextResponse.json({ success: true, uploads });
  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
  }
} 