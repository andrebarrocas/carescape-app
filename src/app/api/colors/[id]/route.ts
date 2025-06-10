import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Color, MediaUpload } from '@/types';

interface ColorWithMedia extends Omit<Color, 'mediaUploads'> {
  mediaUploads: Array<Omit<MediaUpload, 'url'> & { data: Buffer }>;
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Delete the color and all related records (cascade delete is set up in schema)
    await prisma.color.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Color deleted successfully' });
  } catch (error) {
    console.error('Error deleting color:', error);
    return NextResponse.json(
      { error: 'Failed to delete color' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const color = await prisma.color.findUnique({
      where: { id: params.id },
      include: {
        materials: true,
        processes: true,
        mediaUploads: true,
      },
    });

    if (!color) {
      return NextResponse.json(
        { error: 'Color not found' },
        { status: 404 }
      );
    }

    // Parse coordinates from string to object
    let parsedCoordinates = null;
    if (color.coordinates) {
      try {
        parsedCoordinates = JSON.parse(color.coordinates) as { lat: number; lng: number };
      } catch (e) {
        console.error('Failed to parse coordinates for color:', color.name, e);
      }
    }

    // Transform the response to include image URLs
    const transformedColor = {
      ...color,
      coordinates: parsedCoordinates,
      mediaUploads: color.mediaUploads.map(media => ({
        id: media.id,
        filename: media.filename,
        mimetype: media.mimetype,
        type: media.type,
        caption: media.caption,
        url: `/api/images/${media.id}`,
        colorId: media.colorId,
        createdAt: media.createdAt,
        updatedAt: media.updatedAt,
      })),
    };

    return NextResponse.json(transformedColor);
  } catch (error) {
    console.error('Error fetching color:', error);
    return NextResponse.json(
      { error: 'Failed to fetch color' },
      { status: 500 }
    );
  }
} 