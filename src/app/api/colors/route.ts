import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

interface ColorWithMedia {
  id: string;
  name: string;
  hex: string;
  description: string | null;
  aiDescription: string | null;
  location: string;
  coordinates: string | null;
  bioregion: string | null;
  bioregionMap: string | null;
  season: string;
  dateCollected: Date;
  userId: string;
  authorName: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    pseudonym: string | null;
  };
  materials: {
    id: string;
    name: string;
    partUsed: string;
    originNote: string;
    colorId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  processes: {
    id: string;
    technique: string;
    application: string;
    notes: string;
    colorId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  mediaUploads: {
    id: string;
    filename: string;
    mimetype: string;
    type: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  bioregionId: string | null;
}

interface TransformedColor extends Omit<ColorWithMedia, 'coordinates'> {
  coordinates: { lat: number; lng: number } | null;
  mediaUploads: Array<ColorWithMedia['mediaUploads'][0] & { url: string }>;
}

export async function GET() {
  try {
    // Check for NextAuth session
    const session = await getServerSession(authOptions);
    
    // Check for custom auth token
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;
    let customTokenValid = false;
    
    if (authToken) {
      try {
        const decoded = verify(authToken, process.env.NEXTAUTH_SECRET || 'fallback-secret');
        customTokenValid = !!decoded;
      } catch (error) {
        console.error('Custom token verification failed:', error);
      }
    }
    
    if (!session?.user && !customTokenValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const colors = await prisma.color.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            pseudonym: true,
          },
        },
        materials: true,
        processes: true,
        mediaUploads: {
          select: {
            id: true,
            filename: true,
            mimetype: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the response to include image URLs and parse coordinates
    const transformedColors: TransformedColor[] = colors.map((color: ColorWithMedia) => {
      // Parse coordinates from string to object
      let parsedCoordinates = null;
      if (color.coordinates) {
        try {
          parsedCoordinates = JSON.parse(color.coordinates) as { lat: number; lng: number };
        } catch (e) {
          console.error('Failed to parse coordinates for color:', color.name, e);
        }
      }

      return {
        ...color,
        coordinates: parsedCoordinates,
        mediaUploads: color.mediaUploads.map(media => ({
          ...media,
          url: `/api/images/${media.id}`,
        })),
      };
    });

    return NextResponse.json(transformedColors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch colors' },
      { status: 500 }
    );
  }
}

// Helper function to safely get or create a user
async function getOrCreateUser(email: string, authorName?: string) {
  try {
    console.log('getOrCreateUser called with email:', email);
    
    // First try to find existing user
    let user = await prisma.user.findFirst({
      where: { email: email }
    });

    if (!user) {
      console.log('No existing user found, creating new user');
      // Try to create new user
      user = await prisma.user.create({
        data: {
          email: email,
          name: authorName || 'Anonymous',
        }
      });
      console.log('Created new user:', user.id);
    } else {
      console.log('Found existing user:', user.id);
      // Update the user's name if authorName is provided and different from current name
      if (authorName && authorName !== user.name) {
        console.log('Updating user name from', user.name, 'to', authorName);
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name: authorName }
        });
        console.log('Updated user name:', user.name);
      }
    }

    return user;
  } catch (error) {
    console.error('Failed to get or create user with email:', email, error);
    
    // Fallback to anonymous user
    console.log('Falling back to anonymous user');
    let anonymousUser = await prisma.user.findFirst({
      where: { email: 'anonymous@carespace.app' }
    });

    if (!anonymousUser) {
      console.log('Creating anonymous user');
      anonymousUser = await prisma.user.create({
        data: {
          email: 'anonymous@carespace.app',
          name: 'Anonymous',
        }
      });
      console.log('Created anonymous user:', anonymousUser.id);
    } else {
      console.log('Found existing anonymous user:', anonymousUser.id);
    }

    return anonymousUser;
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('Received color submission data:', data);
    console.log('Email from request:', data.email);
    console.log('Email type:', typeof data.email);
    
    const {
      name,
      description,
      aiDescription,
      location,
      coordinates,
      hex,
      sourceMaterial,
      type,
      application,
      process,
      season,
      dateCollected,
      mediaUploads,
      userId,
      authorName,
      email,
    } = data;

    // Get or create user based on email or session
    let finalUserId = userId;
    console.log('Processing user creation/lookup for email:', email);
    
    if (!finalUserId) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        finalUserId = session.user.id;
        console.log('Using session user ID:', finalUserId);
      } else if (email && email !== 'anonymous@carespace.app') {
        // Use the helper function to safely get or create user
        console.log('Getting or creating user with email:', email);
        const user = await getOrCreateUser(email, authorName);
        finalUserId = user.id;
        console.log('Using user ID:', finalUserId);
      } else {
        // No valid email provided, use anonymous user
        console.log('No valid email provided, using anonymous user');
        const anonymousUser = await getOrCreateUser('anonymous@carespace.app', 'Anonymous');
        finalUserId = anonymousUser.id;
        console.log('Using anonymous user ID:', finalUserId);
      }
    }
    
    console.log('Final user ID for color creation:', finalUserId);

    // Verify the user exists before creating the color
    if (finalUserId) {
      const userExists = await prisma.user.findUnique({
        where: { id: finalUserId }
      });
      
      if (!userExists) {
        console.error('User does not exist with ID:', finalUserId);
        // Create anonymous user as fallback
        const anonymousUser = await getOrCreateUser('anonymous@carespace.app', 'Anonymous');
        finalUserId = anonymousUser.id;
        console.log('Using anonymous user as fallback:', finalUserId);
      } else {
        console.log('Verified user exists:', finalUserId);
      }
    } else {
      console.error('No userId available, creating anonymous user');
      const anonymousUser = await getOrCreateUser('anonymous@carespace.app', 'Anonymous');
      finalUserId = anonymousUser.id;
      console.log('Using anonymous user:', finalUserId);
    }

    console.log('Creating color with data:', {
      name,
      description,
      location,
      coordinates,
      hex,
      dateCollected,
      season,
      userId: finalUserId,
      sourceMaterial,
      type,
      application,
      process
    });

    const color = await prisma.color.create({
      data: {
        name,
        description: description || '',
        aiDescription,
        location,
        coordinates: coordinates ? JSON.stringify(coordinates) : null,
        hex,
        dateCollected: new Date(dateCollected),
        season,
        type: type || null,
        userId: finalUserId,
        authorName: authorName || null,
        materials: {
          create: {
            name: sourceMaterial,
            partUsed: 'whole',
            originNote: '',
          },
        },
        processes: {
          create: {
            technique: process,
            application: application || '',
            notes: '',
          },
        },
        mediaUploads: mediaUploads ? {
          create: mediaUploads.map((upload: unknown) => ({
            filename: (upload as { filename: string }).filename,
            mimetype: (upload as { mimetype: string }).mimetype,
            type: (upload as { type: string }).type,
            caption: (upload as { caption: string }).caption,
          })),
        } : undefined,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.error('Error creating color:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'A color with this name already exists' },
          { status: 400 }
        );
      }
      if (error.message.includes('Invalid email')) {
        return NextResponse.json(
          { error: 'Invalid email address provided' },
          { status: 400 }
        );
      }
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'User account issue. Please try again or contact support.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create color. Please try again.' },
      { status: 500 }
    );
  }
} 