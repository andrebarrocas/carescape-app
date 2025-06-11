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

type ExtendedMediaUpload = MediaUpload & {
  comments: Array<Comment & {
    user: Pick<User, 'name' | 'image'>;
  }>;
};

type ExtendedColor = Color & {
  mediaUploads: ExtendedMediaUpload[];
};

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    // Delete the color and all related records (cascade delete is set up in schema)
    await prisma.color.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting color:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Error deleting color',
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return new NextResponse('Color ID is required', { status: 400 });
    }

    // First, get the color with basic relations
    const color = await prisma.color.findUnique({
      where: { id },
      include: {
        materials: true,
        processes: true,
        mediaUploads: true
      }
    });

    if (!color) {
      return new NextResponse('Color not found', { status: 404 });
    }

    // Then, get comments for each media upload
    const mediaUploadsWithComments = await Promise.all(
      color.mediaUploads.map(async (media) => {
        const comments = await prisma.comment.findMany({
          where: { mediaId: media.id },
          include: {
            user: {
              select: {
                name: true,
                image: true
              }
            }
          }
        });

        const { data, ...mediaWithoutData } = media;
        return {
          ...mediaWithoutData,
          comments
        };
      })
    );

    // Combine all data
    const fullColor = {
      ...color,
      mediaUploads: mediaUploadsWithComments
    };

    return NextResponse.json(fullColor);
  } catch (error) {
    console.error('Error fetching color:', error);
    return new NextResponse('Error fetching color', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const data = await request.json();

    // Update the color
    const color = await prisma.color.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        season: data.season,
        materials: {
          updateMany: {
            where: {},
            data: {
              name: data.material.name,
              partUsed: data.material.partUsed,
              originNote: data.material.originNote,
            },
          },
        },
        processes: {
          updateMany: {
            where: {},
            data: {
              technique: data.process.technique,
              application: data.process.application,
              notes: data.process.notes,
            },
          },
        },
      },
      include: {
        materials: true,
        processes: true,
        mediaUploads: {
          select: {
            id: true,
            filename: true,
            mimetype: true,
            type: true,
            caption: true,
          },
        },
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.error('Error updating color:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Error updating color',
      { status: 500 }
    );
  }
} 