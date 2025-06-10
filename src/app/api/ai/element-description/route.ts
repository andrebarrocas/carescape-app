import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { sourceMaterial, type } = await request.json();

    const prompt = `Create a poetic and artistic description of ${sourceMaterial} as a ${type} for color creation, written in the style of a naturalist's field notes or an artist's journal. Include:
1. Its physical characteristics and how they relate to color
2. Its cultural or historical significance in art and color-making
3. Any unique properties or behaviors that make it special for creating color
4. A sensory description that captures its essence

Keep the response around 4-5 sentences, using evocative and descriptive language that would feel at home in an artist's book or field journal.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a poetic naturalist and artist with deep knowledge of natural pigments and color-making materials. You write in a style that combines scientific accuracy with artistic sensibility, similar to the visual essays of Giorgia Lupi."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 250,
      temperature: 0.8,
    });

    return NextResponse.json({ description: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error generating element description:', error);
    return NextResponse.json(
      { error: 'Failed to generate element description' },
      { status: 500 }
    );
  }
} 