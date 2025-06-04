import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

async function downloadImage(url: string): Promise<{ buffer: Buffer; type: string }> {
  const response = await fetch(url);
  const buffer = await response.buffer();
  const type = response.headers.get('content-type') || 'image/jpeg';
  return { buffer, type };
}

async function main() {
  // Clear all existing data
  await prisma.mediaUpload.deleteMany({});
  await prisma.process.deleteMany({});
  await prisma.material.deleteMany({});
  await prisma.color.deleteMany({});
  await prisma.user.deleteMany({});

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      pseudonym: 'TestUser',
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
      name: 'Citrus Yellow',
      hex: '#FFD700',
      description: 'Bright yellow from fresh lemons',
      location: 'Amalfi Coast, Italy',
      coordinates: JSON.stringify({ lat: 40.6333, lng: 14.6029 }),
      season: 'Summer',
      dateCollected: new Date('2024-06-15'),
      userId: user.id,
      materials: {
        create: [
          { name: 'Amalfi Lemon', partUsed: 'Peel', originNote: 'Locally sourced citrus' },
        ],
      },
      processes: {
        create: [
          { technique: 'Extraction', application: 'Natural pigment', notes: 'Cold press method' },
        ],
      },
    },
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
        },
      });
      console.log(`Successfully stored image: ${image.filename}`);
    } catch (error) {
      console.error(`Failed to download/store image ${image.filename}:`, error);
    }
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