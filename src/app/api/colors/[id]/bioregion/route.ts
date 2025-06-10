import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const color = await prisma.color.findUnique({
      where: { id: params.id },
      select: {
        location: true,
        materials: {
          select: {
            name: true,
            partUsed: true,
            originNote: true,
          },
        },
      },
    });

    if (!color) {
      return NextResponse.json(
        { error: 'Color not found' },
        { status: 404 }
      );
    }

    // Generate bioregion description using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a bioregional expert and naturalist. Generate a detailed description of the bioregion based on the location and materials provided. Focus on the ecological and geographical characteristics of the area."
        },
        {
          role: "user",
          content: `Location: ${color.location}\nMaterials: ${color.materials.map(m => `${m.name} (${m.partUsed}) - ${m.originNote}`).join('\n')}`
        }
      ],
      max_tokens: 500,
    });

    const bioregion = completion.choices[0].message.content;

    // Update the color with the bioregion description
    const updatedColor = await prisma.color.update({
      where: { id: params.id },
      data: { bioregion },
    });

    // Generate a map using a mapping service (e.g., Mapbox Static Images API)
    const mapboxToken = process.env.MAPBOX_TOKEN;
    const coordinates = JSON.parse(updatedColor.coordinates || '{}');
    const mapUrl = coordinates.lat && coordinates.lng
      ? `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/pin-s+FF0000(${coordinates.lng},${coordinates.lat})/${coordinates.lng},${coordinates.lat},8/800x400@2x?access_token=${mapboxToken}`
      : null;

    if (mapUrl) {
      await prisma.color.update({
        where: { id: params.id },
        data: { bioregionMap: mapUrl },
      });
    }

    return NextResponse.json({
      bioregion,
      mapUrl,
    });
  } catch (error) {
    console.error('Error generating bioregion:', error);
    return NextResponse.json(
      { error: 'Failed to generate bioregion' },
      { status: 500 }
    );
  }
} 