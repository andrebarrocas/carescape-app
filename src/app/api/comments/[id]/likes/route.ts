import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const session = await getServerSession(authOptions);
    
    // Get total likes count for this comment
    const likesCount = await prisma.commentLike.count({
      where: { commentId }
    });
    
    // Check if current user has liked this comment
    let isLiked = false;
    if (session?.user?.id) {
      const userLike = await prisma.commentLike.findUnique({
        where: {
          commentId_userId: {
            commentId,
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
    console.error('Error fetching comment likes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comment likes' },
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

    const { id: commentId } = await params;
    
    // Check if user already liked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId: session.user.id
        }
      }
    });

    if (existingLike) {
      // Unlike: remove the like
      await prisma.commentLike.delete({
        where: {
          commentId_userId: {
            commentId,
            userId: session.user.id
          }
        }
      });
    } else {
      // Like: create a new like
      await prisma.commentLike.create({
        data: {
          commentId,
          userId: session.user.id
        }
      });
    }

    // Get updated counts
    const likesCount = await prisma.commentLike.count({
      where: { commentId }
    });

    return NextResponse.json({
      likesCount,
      isLiked: !existingLike
    });
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle comment like' },
      { status: 500 }
    );
  }
} 