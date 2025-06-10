import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Color, MediaUpload, Comment, User, Prisma } from '@prisma/client';

interface MediaUploadWithComments extends MediaUpload {
  comments: (Comment & {
    user: Pick<User, 'name' | 'image'> | null;
  })[];
}

interface ColorWithRelations extends Color {
  materials: any[];
  processes: any[];
  mediaUploads: MediaUploadWithComments[];
}

const mediaUploadSelect = {
  id: true,
  type: true,
  caption: true,
  mimetype: true,
  data: false,
  comments: {
    include: {
      user: {
        select: {
          name: true,
          image: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  }
} as const;

type MediaUploadSelect = Prisma.MediaUploadSelect & {
  comments?: {
    include: {
      user: {
        select: {
          name: true;
          image: true;
        };
      };
    };
    orderBy: {
      createdAt: 'desc';
    };
  };
};

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
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
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return new NextResponse('Color ID is required', { status: 400 });
    }

    console.log('Fetching color with ID:', id);
    const color = await prisma.color.findUnique({
      where: { id },
      include: {
        materials: true,
        processes: true,
        mediaUploads: {
          select: {
            id: true,
            type: true,
            caption: true,
            mimetype: true,
            data: false, // Exclude binary data from the response
            comments: {
              include: {
                user: {
                  select: {
                    name: true,
                    image: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!color) {
      return new NextResponse('Color not found', { status: 404 });
    }

    // Transform the response to include proper timestamps
    const transformedColor = {
      ...color,
      mediaUploads: (color as ColorWithRelations).mediaUploads.map((media: MediaUploadWithComments) => ({
        ...media,
        comments: media.comments.map((comment) => ({
          ...comment,
          createdAt: comment.createdAt.toISOString()
        }))
      }))
    };

    console.log('Color found:', color.id);
    return NextResponse.json(transformedColor);
  } catch (error) {
    console.error('Error fetching color:', error);
    return new NextResponse('Error fetching color', { status: 500 });
  }
} 