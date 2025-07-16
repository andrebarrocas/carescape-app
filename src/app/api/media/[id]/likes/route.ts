import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: mediaId } = await params;
    const session = await getServerSession(authOptions);
    
    // Get total likes count for this media
    const likesCount = await prisma.mediaLike.count({
      where: { mediaId }
    });
    
    // Check if current user has liked this media
    let isLiked = false;
    if (session?.user?.id) {
      const userLike = await prisma.mediaLike.findUnique({
        where: {
          mediaId_userId: {
            mediaId,
            userId: session.user.id
          }
        }
      });
      isLiked = !!userLike;
    }
    
    return NextResponse.json({
      likesCount,
      isLiked
    });
  } catch (error) {
    console.error('Error fetching media likes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media likes' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: mediaId } = await params;
    
    // Check if user already liked this media
    const existingLike = await prisma.mediaLike.findUnique({
      where: {
        mediaId_userId: {
          mediaId,
          userId: session.user.id
        }
      }
    });

    if (existingLike) {
      // Unlike: remove the like
      await prisma.mediaLike.delete({
        where: {
          mediaId_userId: {
            mediaId,
            userId: session.user.id
          }
        }
      });
    } else {
      // Like: create a new like
      await prisma.mediaLike.create({
        data: {
          mediaId,
          userId: session.user.id
        }
      });
    }

    // Get updated counts
    const likesCount = await prisma.mediaLike.count({
      where: { mediaId }
    });

    return NextResponse.json({
      likesCount,
      isLiked: !existingLike
    });
  } catch (error) {
    console.error('Error toggling media like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle media like' },
      { status: 500 }
    );
  }
} 