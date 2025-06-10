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
        inspirationalText: true,
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                pseudonym: true,
              },
            },
          },
        },
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
      inspirationalText: image.inspirationalText || '',
      comments: image.comments.map((comment) => ({
        id: comment.id,
        text: comment.content,
        author: comment.user?.pseudonym || comment.user?.name || 'Anonymous',
        createdAt: comment.createdAt.toISOString(),
      })),
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

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const colorId = params.id;
    const data = await request.json();

    const { comment, mediaId } = data;

    const newComment = await prisma.comment.create({
      data: {
        content: comment,
        colorId: colorId,
        mediaId: mediaId,
        userId: 'system', // Replace with actual user ID from auth
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            pseudonym: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: newComment.id,
      text: newComment.content,
      author: newComment.user?.pseudonym || newComment.user?.name || 'Anonymous',
      createdAt: newComment.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
} 