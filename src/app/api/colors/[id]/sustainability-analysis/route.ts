import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const analysis = await prisma.sustainabilityAnalysis.findUnique({
      where: {
        colorId: id,
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    return NextResponse.json({
      summary: analysis.summary,
      advantages: analysis.advantages,
      disadvantages: analysis.disadvantages,
    });
  } catch (error) {
    console.error('Error fetching sustainability analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { summary, advantages, disadvantages } = body;

    // Validate required fields
    if (!summary || !advantages || !disadvantages) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if color exists
    const color = await prisma.color.findUnique({
      where: { id },
    });

    if (!color) {
      return NextResponse.json(
        { error: 'Color not found' },
        { status: 404 }
      );
    }

    // Create or update the analysis
    const analysis = await prisma.sustainabilityAnalysis.upsert({
      where: {
        colorId: id,
      },
      update: {
        summary,
        advantages,
        disadvantages,
      },
      create: {
        colorId: id,
        summary,
        advantages,
        disadvantages,
      },
    });

    return NextResponse.json({
      summary: analysis.summary,
      advantages: analysis.advantages,
      disadvantages: analysis.disadvantages,
    });
  } catch (error) {
    console.error('Error saving sustainability analysis:', error);
    return NextResponse.json(
      { error: 'Failed to save analysis' },
      { status: 500 }
    );
  }
} 