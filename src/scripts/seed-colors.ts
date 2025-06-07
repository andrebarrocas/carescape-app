import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      pseudonym: 'Test User',
    },
  });

  // Saffron Red
  await prisma.color.create({
    data: {
      name: 'Saffron Red',
      hex: '#FF4500',
      description: 'Deep red color from Kashmir Saffron spice threads',
      location: 'Kashmir, India',
      coordinates: JSON.stringify({ lat: 34.0837, lng: 74.7973 }),
      season: 'Fall',
      dateCollected: new Date(),
      userId: user.id,
      materials: {
        create: [{
          name: 'Kashmir Saffron',
          partUsed: 'Stigma threads',
          originNote: 'Harvested from Crocus sativus flowers'
        }]
      },
      processes: {
        create: [{
          technique: 'Natural dye extraction',
          application: 'Direct dye',
          notes: 'Traditional saffron spice processing'
        }]
      }
    }
  });

  // Desert Orange
  await prisma.color.create({
    data: {
      name: 'Desert Orange',
      hex: '#FF8C00',
      description: 'Vibrant orange from Namaqualand Daisies',
      location: 'Namaqualand, South Africa',
      coordinates: JSON.stringify({ lat: -29.6100, lng: 17.9800 }),
      season: 'Spring',
      dateCollected: new Date(),
      userId: user.id,
      materials: {
        create: [{
          name: 'Namaqua Daisy',
          partUsed: 'Flower petals',
          originNote: 'Wild-growing desert flowers'
        }]
      },
      processes: {
        create: [{
          technique: 'Natural dye extraction',
          application: 'Petal infusion',
          notes: 'Seasonal flower collection during bloom'
        }]
      }
    }
  });

  // Ocean Blue
  await prisma.color.create({
    data: {
      name: 'Ocean Blue',
      hex: '#0077BE',
      description: 'Deep ocean blue inspired by marine waters',
      location: 'Pacific Ocean',
      coordinates: JSON.stringify({ lat: 0.0000, lng: -160.0000 }),
      season: 'Summer',
      dateCollected: new Date(),
      userId: user.id,
      materials: {
        create: [{
          name: 'Marine Algae',
          partUsed: 'Whole plant',
          originNote: 'Sustainably harvested seaweed'
        }]
      },
      processes: {
        create: [{
          technique: 'Natural dye extraction',
          application: 'Seaweed processing',
          notes: 'Traditional marine dye techniques'
        }]
      }
    }
  });

  // Citrus Yellow
  await prisma.color.create({
    data: {
      name: 'Citrus Yellow',
      hex: '#FFD700',
      description: 'Bright yellow from fresh lemons',
      location: 'Amalfi Coast, Italy',
      coordinates: JSON.stringify({ lat: 40.6333, lng: 14.6029 }),
      season: 'Summer',
      dateCollected: new Date(),
      userId: user.id,
      materials: {
        create: [{
          name: 'Amalfi Lemon',
          partUsed: 'Fruit peel',
          originNote: 'Traditional Italian citrus'
        }]
      },
      processes: {
        create: [{
          technique: 'Natural pigment extraction',
          application: 'Peel processing',
          notes: 'Traditional citrus pigment extraction'
        }]
      }
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 