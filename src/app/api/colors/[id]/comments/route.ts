import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: { colorId: params.id },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(comments);
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
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: colorId } = context.params;
    const { content, mediaId } = await request.json();

    // Get or create anonymous user if no session
    let userId = session?.user?.id;
    if (!userId) {
      const anonymousUser = await prisma.user.findFirst({
        where: { email: 'anonymous@carespace.app' }
      });

      if (!anonymousUser) {
        const newAnonymousUser = await prisma.user.create({
          data: {
            email: 'anonymous@carespace.app',
            name: 'Anonymous User',
          }
        });
        userId = newAnonymousUser.id;
      } else {
        userId = anonymousUser.id;
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        colorId,
        mediaId,
        userId,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Error creating comment',
      { status: 500 }
    );
  }
} 