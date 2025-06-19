import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get or create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      pseudonym: 'Test User',
    },
  });

  // Create flamingo
  await prisma.animal.create({
    data: {
      name: 'Greater Flamingo',
      type: 'Wading Bird',
      description: 'A majestic greater flamingo observed in its natural habitat, displaying its characteristic pink plumage. These remarkable birds get their pink coloration from the carotenoid pigments in the algae and small crustaceans that make up their diet. They are a testament to the delicate synergy between humans and animals that populate the salt marsh, as described in multispecies ethnographic studies.',
      location: 'Salinas do Samouco salt marsh complex',
      coordinates: JSON.stringify({ lat: 23.5, lng: -82.3 }),
      image: '/images/animals/flamingo-rosa.jpg',
      date: new Date('2024-03-15'),
      userId: user.id
    }
  });

  console.log('Animals seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 