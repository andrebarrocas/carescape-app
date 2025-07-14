import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function downloadImage(url: string): Promise<{ buffer: Buffer; type: string }> {
  const response = await fetch(url);
  const buffer = await response.buffer();
  const type = response.headers.get('content-type') || 'image/jpeg';
  return { buffer, type };
}

async function main() {
  // Clear all existing data
  await prisma.comment.deleteMany();
  await prisma.mediaUpload.deleteMany();
  await prisma.process.deleteMany();
  await prisma.material.deleteMany();
  await prisma.color.deleteMany();
  await prisma.user.deleteMany({});

  // Create test user with password
  const hashedPassword = await hash('password123', 12);
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      pseudonym: 'TestUser',
      password: hashedPassword,
    },
  });

  // Create colors
  const oceanBlue = await prisma.color.create({
    data: {
      name: 'Ocean Blue',
      hex: '#0077BE',
      description: 'Deep ocean blue inspired by marine waters',
      location: 'Pacific Ocean',
      coordinates: JSON.stringify({ lat: 23.4162, lng: -155.2833 }),
      season: 'Summer',
      dateCollected: new Date('2024-07-15'),
      userId: user.id,
      materials: {
        create: [
          { name: 'Marine Algae', partUsed: 'Whole plant', originNote: 'Harvested from deep waters' },
        ],
      },
      processes: {
        create: [
          { technique: 'Extraction', application: 'Natural dye', notes: 'Cold process extraction' },
        ],
      },
    },
  });

  const desertOrange = await prisma.color.create({
    data: {
      name: 'Desert Orange',
      hex: '#FF8C42',
      description: 'Vibrant orange from desert flowers',
      location: 'Namaqualand, South Africa',
      coordinates: JSON.stringify({ lat: -30.1652, lng: 17.9839 }),
      season: 'Spring',
      dateCollected: new Date('2024-09-15'),
      userId: user.id,
      materials: {
        create: [
          { name: 'Namaqua Daisy', partUsed: 'Petals', originNote: 'Wild harvested during bloom season' },
        ],
      },
      processes: {
        create: [
          { technique: 'Petal Extraction', application: 'Natural dye', notes: 'Traditional method' },
        ],
      },
    },
  });

  const citrusYellow = await prisma.color.create({
    data: {
      id: 'citrus-yellow',
      name: 'Citrus Yellow',
      hex: '#FFD700',
      description: 'A vibrant yellow extracted from fresh lemon peels, capturing the essence of Mediterranean citrus groves.',
      location: 'Sorrento Lemon Grove, Amalfi Coast, Italy',
      coordinates: JSON.stringify({
        lat: 40.6262,
        lng: 14.3757
      }),
      season: 'Summer',
      dateCollected: new Date('2024-06-15'),
      userId: user.id,
      materials: {
        create: [
          {
            name: 'Lemon',
            partUsed: 'Peel',
            originNote: 'Organically grown Sorrento lemons, known for their intense fragrance and rich oils'
          }
        ]
      },
      processes: {
        create: [
          {
            technique: 'Natural Extraction',
            application: 'Cold Press',
            notes: 'Gentle extraction of pigments from fresh lemon peels, preserving the natural vibrancy'
          }
        ]
      }
    }
  });

  const saffronRed = await prisma.color.create({
    data: {
      name: 'Saffron Red',
      hex: '#FF4500',
      description: 'Rich red from premium saffron',
      location: 'Kashmir, India',
      coordinates: JSON.stringify({ lat: 34.0837, lng: 74.7973 }),
      season: 'Autumn',
      dateCollected: new Date('2024-10-10'),
      userId: user.id,
      materials: {
        create: [
          { name: 'Kashmir Saffron', partUsed: 'Stigmas', originNote: 'Hand-harvested saffron crocus' },
        ],
      },
      processes: {
        create: [
          { technique: 'Infusion', application: 'Natural dye', notes: 'Traditional method' },
        ],
      },
    },
  });

  // Download and store images
  const images = [
    {
      url: 'https://bernardmarr.com/img/What%20Is%20Blue%20Ocean%20Strategy%20And%20How%20Can%20You%20Create%20One.png',
      filename: 'ocean-blue.png',
      colorId: oceanBlue.id,
    },
    {
      url: 'https://i.pinimg.com/736x/bb/87/1e/bb871e4d55a517a8fa5fd636e54bf751.jpg',
      filename: 'desert-orange.jpg',
      colorId: desertOrange.id,
    },
    {
      url: 'https://media.post.rvohealth.io/wp-content/uploads/2020/09/sliced-lemons-thumb.jpg',
      filename: 'citrus-yellow.jpg',
      colorId: citrusYellow.id,
    },
    {
      url: 'https://cdn.britannica.com/83/191983-050-9D97C943/saffron-spice-herb.jpg',
      filename: 'saffron-red.jpg',
      colorId: saffronRed.id,
    },
  ];

  for (const image of images) {
    try {
      const { buffer, type } = await downloadImage(image.url);
      await prisma.mediaUpload.create({
        data: {
          filename: image.filename,
          mimetype: type,
          data: buffer,
          type: 'outcome',
          colorId: image.colorId,
          caption: `Sample image for ${image.filename}`
        },
      });
      console.log(`Successfully stored image: ${image.filename}`);
    } catch (error) {
      console.error(`Failed to download/store image ${image.filename}:`, error);
    }
  }

  // Add test images for Citrus Yellow
  const testImages = [
    {
      filename: 'lemon-zest.jpg',
      type: 'process',
      caption: 'Freshly grated lemon zest showing the intense yellow pigment',
      url: 'https://example.com/images/lemon-zest.jpg'
    },
    {
      filename: 'lemon-halves.jpg',
      type: 'process',
      caption: 'Cross-section of Sorrento lemons revealing their structure',
      url: 'https://example.com/images/lemon-halves.jpg'
    },
    {
      filename: 'lemon-illustration.jpg',
      type: 'process',
      caption: 'Traditional botanical illustration of a lemon slice',
      url: 'https://example.com/images/lemon-illustration.jpg'
    },
    {
      filename: 'lemon-landscape.jpg',
      type: 'landscape',
      caption: 'Sorrento lemon grove with the Amalfi Coast in the background',
      url: 'https://example.com/images/lemon-landscape.jpg'
    }
  ];

  for (const image of testImages) {
    await prisma.mediaUpload.create({
      data: {
        filename: image.filename,
        mimetype: 'image/jpeg',
        type: image.type,
        caption: image.caption,
        colorId: citrusYellow.id,
        data: Buffer.from('test-image-data'),
      },
    });
  }

  console.log('Database has been seeded with fresh data and binary images. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 