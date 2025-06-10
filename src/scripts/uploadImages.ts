import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

async function uploadImages() {
  try {
    // Get the first user from the database
    const user = await prisma.user.findFirst();
    
    if (!user?.id) {
      throw new Error('No user found in the database');
    }

    // Create the color first
    const color = await prisma.color.create({
      data: {
        name: "Citrus Yellow",
        hex: "#FFD700",
        description: "A vibrant yellow extracted from fresh lemon peels, capturing the essence of Mediterranean citrus groves.",
        location: "Sorrento Lemon Grove, Amalfi Coast, Italy",
        coordinates: JSON.stringify({ lat: 40.6262, lng: 14.3757 }), // Sorrento coordinates
        bioregion: JSON.stringify({
          description: "Mediterranean coastal citrus-growing region",
          boundary: {
            type: "Polygon",
            coordinates: [[[14.3757, 40.6262], [14.3857, 40.6362], [14.3957, 40.6262], [14.3857, 40.6162], [14.3757, 40.6262]]]
          }
        }),
        season: "Summer",
        dateCollected: new Date("2024-06-15"),
        userId: user.id,
        materials: {
          create: [{
            name: "Lemon",
            partUsed: "Peel",
            originNote: "Fresh Sorrento lemons from local groves"
          }]
        },
        processes: {
          create: [{
            technique: "Extraction and grinding",
            application: "Direct pigment extraction",
            notes: "Carefully peeled and ground to extract natural pigments"
          }]
        }
      }
    });

    // Define image data
    const images = [
      {
        filename: "sorrento-lemon-grove.jpg",
        type: "landscape",
        caption: "Sorrento lemon grove with the Amalfi Coast in the background",
        path: path.join(process.cwd(), "public", "images", "lemon-grove.jpg")
      },
      {
        filename: "lemon-zest.jpg",
        type: "process",
        caption: "Freshly grated lemon zest showing the intense yellow pigment",
        path: path.join(process.cwd(), "public", "images", "lemon-zest.jpg")
      },
      {
        filename: "lemon-cross-section.jpg",
        type: "process",
        caption: "Cross-section of Sorrento lemons revealing their structure",
        path: path.join(process.cwd(), "public", "images", "lemon-cross-section.jpg")
      }
    ];

    // Upload each image
    for (const image of images) {
      const data = await fs.readFile(image.path);
      await prisma.mediaUpload.create({
        data: {
          filename: image.filename,
          mimetype: "image/jpeg",
          type: image.type,
          data,
          caption: image.caption,
          colorId: color.id
        }
      });
      console.log(`Uploaded ${image.filename}`);
    }

    console.log('Successfully created color and uploaded images');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

uploadImages(); 