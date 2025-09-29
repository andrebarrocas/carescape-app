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
    const { id: mediaId } = await params;
    
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
    
    // Get total likes count for this media
    const likesCount = await prisma.mediaLike.count({
      where: { mediaId }
    });
    
    // Check if current user has liked this media
    let isLiked = false;
    if (user) {
      const userLike = await prisma.mediaLike.findUnique({
        where: {
          mediaId_userId: {
            mediaId,
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
    const { id: mediaId } = await params;
    
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
    
    // Check if user already liked this media
    const existingLike = await prisma.mediaLike.findUnique({
      where: {
        mediaId_userId: {
          mediaId,
          userId: user.id
        }
      }
    });

    if (existingLike) {
      // Unlike: remove the like
      await prisma.mediaLike.delete({
        where: {
          mediaId_userId: {
            mediaId,
            userId: user.id
          }
        }
      });
    } else {
      // Like: create a new like
      await prisma.mediaLike.create({
        data: {
          mediaId,
          userId: user.id
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