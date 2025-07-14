import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Fallback descriptions for when OpenAI API is not available
const fallbackDescriptions: Record<string, string> = {
  default: "This region is characterized by its unique ecological features and diverse landscapes. The area supports a variety of native flora and fauna adapted to local conditions.",
  desert: "This arid bioregion is characterized by low rainfall and extreme temperatures. Desert-adapted plants and animals thrive in these challenging conditions.",
  forest: "This forested bioregion features diverse tree species and rich understory vegetation. The ecosystem supports a complex network of wildlife.",
  coastal: "This coastal bioregion is influenced by marine conditions, with unique flora adapted to salt spray and sandy soils. Marine and terrestrial ecosystems intersect here.",
  mountain: "This mountainous bioregion features distinct elevation zones and varied microclimates. Plant and animal species are adapted to different altitudinal conditions."
};

function getBioregionType(lat: number, lng: number): string {
  // Simple logic to determine bioregion type based on coordinates
  if (Math.abs(lat) < 23.5) return 'desert';
  if (Math.abs(lng) < 30) return 'forest';
  if (Math.abs(lat) > 60) return 'mountain';
  if (Math.abs(lng) > 150) return 'coastal';
  return 'default';
}

export async function POST(request: Request) {
  try {
    const { lat, lng } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    let description: string;

    // Create a more detailed boundary with multiple layers
    const layers = [
      { distance: 0.5, color: '#FF0000' },  // Core area
      { distance: 0.75, color: '#FFA500' }, // Buffer zone
      { distance: 1.0, color: '#FFFF00' }   // Transition zone
    ];

    const boundaries = layers.map(layer => ({
      color: layer.color,
      points: [
        [lat - layer.distance, lng - layer.distance],
        [lat - layer.distance, lng + layer.distance],
        [lat + layer.distance, lng + layer.distance],
        [lat + layer.distance, lng - layer.distance],
        [lat - layer.distance, lng - layer.distance]
      ]
    }));

    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not found');
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const prompt = `Given the coordinates (${lat}, ${lng}), describe the bioregion of this location based on the OneEarth Bioregions Framework. Include the name of the bioregion and its key ecological characteristics. Keep the response concise, around 2-3 sentences.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a biogeography expert with deep knowledge of the OneEarth Bioregions Framework. You provide accurate information about bioregions and their characteristics."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      description = completion.choices[0].message.content || fallbackDescriptions[getBioregionType(lat, lng)];
    } catch (error) {
      console.warn('Failed to get OpenAI response, using fallback:', error);
      description = fallbackDescriptions[getBioregionType(lat, lng)];
    }

    return NextResponse.json({
      description,
      boundaries
    });
  } catch (error) {
    console.error('Error in bioregion API:', error);
    return NextResponse.json(
      { error: 'Failed to generate bioregion description', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 