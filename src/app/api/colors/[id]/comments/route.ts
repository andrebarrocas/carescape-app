import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }
    const { id: colorId } = await params;
    const { content, mediaId, parentId } = await request.json();

    // Ensure the user exists in the database and has the correct name
    let user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      const userData: any = { id: session.user.id };
      if (session.user.email) userData.email = session.user.email;
      if (session.user.name) userData.name = session.user.name;
      if (session.user.pseudonym) userData.pseudonym = session.user.pseudonym;
      user = await prisma.user.create({ data: userData });
    } else {
      // Update user data if it has changed
      const updateData: any = {};
      if (session.user.name && user.name !== session.user.name) {
        updateData.name = session.user.name;
      }
      if (session.user.pseudonym && user.pseudonym !== session.user.pseudonym) {
        updateData.pseudonym = session.user.pseudonym;
      }
      if (session.user.email && user.email !== session.user.email) {
        updateData.email = session.user.email;
      }
      
      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData
        });
      }
    }

    // Create the comment using the logged user's ID
    const comment = await prisma.comment.create({
      data: {
        content,
        colorId,
        mediaId,
        userId: session.user.id,
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