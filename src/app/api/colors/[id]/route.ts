import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Comment, User, MediaUpload } from '@prisma/client';

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return new NextResponse('Color ID is required', { status: 400 });
    }

    // Delete the color and all related data
    await prisma.color.delete({
      where: { id },
    });

    return new NextResponse('Color deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Error deleting color:', error);
    return new NextResponse('Error deleting color', { status: 500 });
  }
}

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return new NextResponse('Color ID is required', { status: 400 });
    }

    // Get the color with basic relations
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

    // --- OPTIMIZED: Fetch all comments for all media uploads in one query ---
    const mediaIds = color.mediaUploads.map(m => m.id);
    let allComments: any[] = [];
    if (mediaIds.length > 0) {
      allComments = await prisma.comment.findMany({
        where: { mediaId: { in: mediaIds } },
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        }
      });
    }
    // Group comments by mediaId
    const commentsByMediaId: Record<string, any[]> = {};
    for (const comment of allComments) {
      const mediaId = comment.mediaId;
      if (!commentsByMediaId[mediaId]) commentsByMediaId[mediaId] = [];
      commentsByMediaId[mediaId].push({
        ...comment,
        createdAt: comment.createdAt?.toISOString?.() || null,
        updatedAt: comment.updatedAt?.toISOString?.() || null,
      });
    }
    // Attach comments to each media upload
    const mediaUploadsWithComments = color.mediaUploads.map(media => ({
      ...media,
      createdAt: media.createdAt?.toISOString?.() || null,
      updatedAt: media.updatedAt?.toISOString?.() || null,
      comments: commentsByMediaId[media.id] || []
    }));
    // Format color object
    const colorObj = {
      ...color,
      dateCollected: color.dateCollected?.toISOString?.() || null,
      createdAt: color.createdAt?.toISOString?.() || null,
      updatedAt: color.updatedAt?.toISOString?.() || null,
      materials: color.materials.map(m => ({
        ...m,
        createdAt: m.createdAt?.toISOString?.() || null,
        updatedAt: m.updatedAt?.toISOString?.() || null
      })),
      processes: color.processes.map(p => ({
        ...p,
        createdAt: p.createdAt?.toISOString?.() || null,
        updatedAt: p.updatedAt?.toISOString?.() || null
      })),
      mediaUploads: mediaUploadsWithComments,
    };
    return NextResponse.json(colorObj, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600',
        'ETag': `"${color.id}-${color.updatedAt}"`
      }
    });
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
    const { id } = await context.params;
    const body = await request.json();
    // Update the color
    const color = await prisma.color.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        location: body.location,
        season: body.season,
        materials: {
          updateMany: {
            where: {},
            data: {
              name: body.material?.name,
              partUsed: body.material?.partUsed,
              originNote: body.material?.originNote,
            },
          },
        },
        processes: {
          updateMany: {
            where: {},
            data: {
              technique: body.process?.technique,
              application: body.process?.application,
              notes: body.process?.notes,
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

// --- Storytelling Full Details Endpoint ---
export async function GET_full(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return new NextResponse('Color ID is required', { status: 400 });
    }
    
    // Get the color with all relations in a single optimized query
    const color = await prisma.color.findUnique({
      where: { id },
      include: {
        materials: {
          select: {
            id: true,
            name: true,
            partUsed: true,
            originNote: true,
            createdAt: true,
            updatedAt: true
          }
        },
        processes: {
          select: {
            id: true,
            technique: true,
            application: true,
            notes: true,
            createdAt: true,
            updatedAt: true
          }
        },
        mediaUploads: {
          select: {
            id: true,
            filename: true,
            mimetype: true,
            type: true,
            caption: true,
            createdAt: true,
            updatedAt: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            pseudonym: true,
          }
        }
      }
    });
    
    if (!color) {
      return new NextResponse('Color not found', { status: 404 });
    }
    
    // Only fetch comments if there are media uploads
    let mediaUploadsWithComments: any[] = [];
    if (color.mediaUploads.length > 0) {
      const mediaIds = color.mediaUploads.map(m => m.id);
      
      // Fetch comments with pagination to limit data
      const allComments = await prisma.comment.findMany({
        where: { mediaId: { in: mediaIds } },
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50 // Limit to 50 most recent comments total
      });
      
      // Group comments by mediaId
      const commentsByMediaId: Record<string, any[]> = {};
      for (const comment of allComments) {
        const mediaId = comment.mediaId;
        if (!commentsByMediaId[mediaId]) commentsByMediaId[mediaId] = [];
        commentsByMediaId[mediaId].push({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt?.toISOString?.() || null,
          updatedAt: comment.updatedAt?.toISOString?.() || null,
          user: comment.user
        });
      }
      
      // Attach comments to each media upload
      mediaUploadsWithComments = color.mediaUploads.map(media => ({
        ...media,
        createdAt: media.createdAt?.toISOString?.() || null,
        updatedAt: media.updatedAt?.toISOString?.() || null,
        comments: commentsByMediaId[media.id] || []
      }));
    }
    
    // Parse bioregion data from string if present
    const bioregion = color.bioregion ? JSON.parse(color.bioregion) : null;
    
    // Format color object with optimized data structure
    const colorObj = {
      id: color.id,
      name: color.name,
      hex: color.hex,
      description: color.description,
      location: color.location,
      coordinates: color.coordinates,
      bioregion,
      dateCollected: color.dateCollected?.toISOString?.() || null,
      season: color.season,
      materials: color.materials.map(m => ({
        id: m.id,
        name: m.name,
        partUsed: m.partUsed,
        originNote: m.originNote,
        createdAt: m.createdAt?.toISOString?.() || null,
        updatedAt: m.updatedAt?.toISOString?.() || null
      })),
      processes: color.processes.map(p => ({
        id: p.id,
        technique: p.technique,
        application: p.application,
        notes: p.notes,
        createdAt: p.createdAt?.toISOString?.() || null,
        updatedAt: p.updatedAt?.toISOString?.() || null
      })),
      mediaUploads: mediaUploadsWithComments,
      createdAt: color.createdAt?.toISOString?.() || null,
      updatedAt: color.updatedAt?.toISOString?.() || null,
      userId: color.userId,
      user: color.user
    };
    
    return NextResponse.json({ 
      color: colorObj, 
      mediaUploads: mediaUploadsWithComments, 
      session: null 
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600', // Cache for 5 minutes client, 10 minutes CDN
        'ETag': `"${color.id}-${color.updatedAt}"` // Add ETag for conditional requests
      }
    });
  } catch (error) {
    console.error('Error fetching full color details:', error);
    return new NextResponse('Error fetching full color details', { status: 500 });
  }
} 