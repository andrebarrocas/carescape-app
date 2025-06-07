import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Delete the color and all related records (cascade delete is set up in schema)
    await prisma.color.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Color deleted successfully' });
  } catch (error) {
    console.error('Error deleting color:', error);
    return NextResponse.json(
      { error: 'Failed to delete color' },
      { status: 500 }
    );
  }
} 