import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Color from '@/lib/models/Color';
import Material from '@/lib/models/Material';
import Process from '@/lib/models/Process';
import MediaUpload from '@/lib/models/MediaUpload';
import ColorTag from '@/lib/models/ColorTag';

export async function GET() {
  try {
    await dbConnect();
    
    // Get all colors with their related data
    const colors = await Color.find({}).populate('userId', 'pseudonym');
    
    // For each color, get its related data
    const colorsWithData = await Promise.all(colors.map(async (color) => {
      const materials = await Material.find({ colorId: color._id });
      const processes = await Process.find({ colorId: color._id });
      const mediaUploads = await MediaUpload.find({ colorId: color._id });
      const colorTags = await ColorTag.find({ colorId: color._id }).populate('tagId', 'name');
      
      return {
        ...color.toObject(),
        materials,
        processes,
        mediaUploads,
        tags: colorTags.map(ct => ct.tagId),
      };
    }));

    return NextResponse.json(colorsWithData);
  } catch (error) {
    console.error('Error fetching colors:', error);
    return NextResponse.json({ error: 'Failed to fetch colors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect();

    // Create the color first
    const color = await Color.create({
      name: body.name,
      hex: body.hex,
      description: body.description,
      season: body.season,
      dateCollected: body.dateCollected,
      locationGeom: body.locationGeom,
      userId: body.userId,
    });

    // Create related records if provided
    if (body.materials?.length) {
      await Material.insertMany(
        body.materials.map((m: any) => ({ ...m, colorId: color._id }))
      );
    }

    if (body.processes?.length) {
      await Process.insertMany(
        body.processes.map((p: any) => ({ ...p, colorId: color._id }))
      );
    }

    if (body.mediaUploads?.length) {
      await MediaUpload.insertMany(
        body.mediaUploads.map((m: any) => ({ ...m, colorId: color._id }))
      );
    }

    if (body.tags?.length) {
      await ColorTag.insertMany(
        body.tags.map((tagId: string) => ({ colorId: color._id, tagId }))
      );
    }

    // Return the color with its related data
    const colorWithData = await Color.findById(color._id)
      .populate('userId', 'pseudonym');
    
    const materials = await Material.find({ colorId: color._id });
    const processes = await Process.find({ colorId: color._id });
    const mediaUploads = await MediaUpload.find({ colorId: color._id });
    const colorTags = await ColorTag.find({ colorId: color._id }).populate('tagId', 'name');

    return NextResponse.json({
      ...colorWithData?.toObject(),
      materials,
      processes,
      mediaUploads,
      tags: colorTags.map(ct => ct.tagId),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating color:', error);
    return NextResponse.json({ error: 'Failed to create color' }, { status: 500 });
  }
} 