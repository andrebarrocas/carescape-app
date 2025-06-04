import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { GET as authHandler } from '@/app/api/auth/[...nextauth]/route';
import { Session } from 'next-auth';

interface ExtendedSession extends Session {
  user?: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

const authOptions = authHandler.config;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Create unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;

    // Save to public directory based on type
    const directory = join(process.cwd(), 'public', 'uploads', type);
    await writeFile(join(directory, filename), buffer);

    // Return the URL
    const url = `/uploads/${type}/${filename}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 