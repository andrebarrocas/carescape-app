import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Helper function to get display name
function getDisplayName(user: any): string {
  if (user.pseudonym) {
    return user.pseudonym;
  } else if (user.name) {
    return user.name;
  } else if (user.email && user.email !== 'anonymous@carespace.app') {
    return user.email.split('@')[0];
  }
  return 'Anonymous';
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comments = await prisma.comment.findMany({
      where: { colorId: id },
      include: {
        user: {
          select: {
            name: true,
            pseudonym: true,
            email: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                name: true,
                pseudonym: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const commentsWithDisplayName = comments.map((comment: any) => {
      const displayName = getDisplayName(comment.user);
      const repliesWithDisplayName = comment.replies.map((reply: any) => ({
        ...reply,
        user: {
          ...reply.user,
          displayName: getDisplayName(reply.user),
        },
      }));

      return {
        ...comment,
        user: {
          ...comment.user,
          displayName,
        },
        replies: repliesWithDisplayName,
      };
    });

    return NextResponse.json(commentsWithDisplayName);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: colorId } = await params;
    const { content, mediaId, parentId } = await request.json();

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

    // Create the comment using the user's ID
    const comment = await prisma.comment.create({
      data: {
        content,
        colorId,
        mediaId,
        userId: user.id,
        ...(parentId ? { parentId } : {})
      },
      include: {
        user: {
          select: {
            name: true,
            pseudonym: true,
            email: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                name: true,
                pseudonym: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    const displayName = getDisplayName(comment.user);
    const repliesWithDisplayName = comment.replies.map((reply: any) => ({
      ...reply,
      user: {
        ...reply.user,
        displayName: getDisplayName(reply.user),
      },
    }));
    
    const commentWithDisplayName = {
      ...comment,
      user: {
        ...comment.user,
        displayName,
      },
      replies: repliesWithDisplayName,
    };

    return NextResponse.json(commentWithDisplayName);
  } catch (error) {
    console.error('Error creating comment:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Error creating comment',
      { status: 500 }
    );
  }
} 