import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.mediaUpload.deleteMany();
  await prisma.process.deleteMany();
  await prisma.material.deleteMany();
  await prisma.color.deleteMany();
  await prisma.user.deleteMany();

  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      pseudonym: 'Test User',
    }
  });

  // Create test colors with coordinates and images
  const colors = [
    {
      name: 'Indigo Blue',
      hex: '#00416A',
      description: 'Traditional indigo dye from Japan',
      location: 'Tokushima, Japan',
      coordinates: JSON.stringify({ lat: 34.0658, lng: 134.5593 }),
      season: 'Summer',
      dateCollected: new Date('2024-07-15'),
      materials: [
        { name: 'Indigo plant', partUsed: 'Leaves', originNote: 'Cultivated in Tokushima' },
        { name: 'Limestone', partUsed: 'Mineral', originNote: 'Local limestone' }
      ],
      processes: [
        { technique: 'Fermentation', application: 'Dye', notes: 'Traditional sukumo method' },
        { technique: 'Oxidation', application: 'Dye', notes: 'Air exposure process' }
      ],
      images: [
        'https://via.placeholder.com/400x400/00416A/FFFFFF?text=Indigo%20Blue',
        'https://via.placeholder.com/400x400/00416A/FFFFFF?text=Process'
      ]
    },
    {
      name: 'Cochineal Red',
      hex: '#BE0039',
      description: 'Natural red dye from cochineal insects',
      location: 'Oaxaca, Mexico',
      coordinates: JSON.stringify({ lat: 17.0732, lng: -96.7266 }),
      season: 'Spring',
      dateCollected: new Date('2024-03-20'),
      materials: [
        { name: 'Cochineal insects', partUsed: 'Whole insect', originNote: 'Harvested from nopal cactus' },
        { name: 'Alum', partUsed: 'Mineral', originNote: 'Mordant material' }
      ],
      processes: [
        { technique: 'Grinding', application: 'Dye', notes: 'Ground into fine powder' },
        { technique: 'Mordanting', application: 'Dye', notes: 'Alum mordant process' }
      ],
      images: [
        'https://via.placeholder.com/400x400/BE0039/FFFFFF?text=Cochineal%20Red',
        'https://via.placeholder.com/400x400/BE0039/FFFFFF?text=Process'
      ]
    },
    {
      name: 'Ochre Yellow',
      hex: '#FFB627',
      description: 'Natural earth pigment',
      location: 'Roussillon, France',
      coordinates: JSON.stringify({ lat: 43.9021, lng: 5.2929 }),
      season: 'Summer',
      dateCollected: new Date('2024-06-15'),
      materials: [
        { name: 'Yellow ochre', partUsed: 'Mineral', originNote: 'Mined from Roussillon quarries' },
        { name: 'Clay', partUsed: 'Mineral', originNote: 'Local clay deposits' }
      ],
      processes: [
        { technique: 'Mining', application: 'Pigment', notes: 'Traditional quarrying methods' },
        { technique: 'Grinding', application: 'Pigment', notes: 'Ground into fine powder' }
      ],
      images: [
        'https://via.placeholder.com/400x400/FFB627/FFFFFF?text=Ochre%20Yellow',
        'https://via.placeholder.com/400x400/FFB627/FFFFFF?text=Process'
      ]
    },
    {
      name: 'Madder Rose',
      hex: '#E84E66',
      description: 'Traditional pink dye from madder root',
      location: 'Istanbul, Turkey',
      coordinates: JSON.stringify({ lat: 41.0082, lng: 28.9784 }),
      season: 'Spring',
      dateCollected: new Date('2024-04-10'),
      materials: [
        { name: 'Madder root', partUsed: 'Root', originNote: 'Cultivated madder plants' },
        { name: 'Alum', partUsed: 'Mineral', originNote: 'Mordant material' }
      ],
      processes: [
        { technique: 'Extraction', application: 'Dye', notes: 'Root extraction process' },
        { technique: 'Mordanting', application: 'Dye', notes: 'Alum mordant process' }
      ],
      images: [
        'https://via.placeholder.com/400x400/E84E66/FFFFFF?text=Madder%20Rose',
        'https://via.placeholder.com/400x400/E84E66/FFFFFF?text=Process'
      ]
    }
  ];

  for (const color of colors) {
    const createdColor = await prisma.color.create({
      data: {
        name: color.name,
        hex: color.hex,
        description: color.description,
        location: color.location,
        coordinates: color.coordinates,
        season: color.season,
        dateCollected: color.dateCollected,
        userId: user.id,
        materials: {
          create: color.materials
        },
        processes: {
          create: color.processes
        },
        mediaUploads: {
          create: color.images.map(url => ({
            url,
            type: 'outcome'
          }))
        }
      }
    });
    console.log(`Created color: ${createdColor.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 