import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const commentsWithDisplayName = comments.map((comment: any) => {
      let displayName = 'Anonymous';
      if (comment.user.name) {
        displayName = comment.user.name;
      } else if (comment.user.email && comment.user.email !== 'anonymous@carespace.app') {
        displayName = comment.user.email.split('@')[0];
      }
      return {
        ...comment,
        user: {
          ...comment.user,
          displayName,
        },
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
    } else if (session.user.name && user.name !== session.user.name) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: session.user.name }
      });
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
      },
    });

    let displayName = 'Anonymous';
    if (comment.user.name) {
      displayName = comment.user.name;
    } else if (comment.user.email && comment.user.email !== 'anonymous@carespace.app') {
      displayName = comment.user.email.split('@')[0];
    }
    
    const commentWithDisplayName = {
      ...comment,
      user: {
        ...comment.user,
        displayName,
      },
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