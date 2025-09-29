import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    
    // Get user email from cookie
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;
    let userEmail = 'anonymous@carespace.app';
    let userId = null;

    if (authToken) {
      try {
        const decoded = verify(authToken, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
        userEmail = decoded.email || 'anonymous@carespace.app';
        userId = decoded.userId;
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }

    // Get or create user based on email
    let user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      user = await prisma.user.create({ 
        data: { 
          email: userEmail,
          name: userEmail.split('@')[0],
          pseudonym: userEmail.split('@')[0]
        } 
      });
    }
    
    // Get total likes count for this comment
    const likesCount = await prisma.commentLike.count({
      where: { commentId }
    });
    
    // Check if current user has liked this comment
    let isLiked = false;
    if (user) {
      const userLike = await prisma.commentLike.findUnique({
        where: {
          commentId_userId: {
            commentId,
            userId: user.id
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
    const { id: commentId } = await params;
    
    // Get user email from cookie
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;
    let userEmail = 'anonymous@carespace.app';
    let userId = null;

    if (authToken) {
      try {
        const decoded = verify(authToken, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
        userEmail = decoded.email || 'anonymous@carespace.app';
        userId = decoded.userId;
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }

    // Get or create user based on email
    let user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      user = await prisma.user.create({ 
        data: { 
          email: userEmail,
          name: userEmail.split('@')[0],
          pseudonym: userEmail.split('@')[0]
        } 
      });
    }
    
    // Check if user already liked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId: user.id
        }
      }
    });

    if (existingLike) {
      // Unlike: remove the like
      await prisma.commentLike.delete({
        where: {
          commentId_userId: {
            commentId,
            userId: user.id
          }
        }
      });
    } else {
      // Like: create a new like
      await prisma.commentLike.create({
        data: {
          commentId,
          userId: user.id
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