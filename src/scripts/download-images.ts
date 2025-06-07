import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

const images = [
  {
    url: 'https://cdn.britannica.com/83/191983-050-9D97C943/saffron-spice-herb.jpg',
    type: 'outcome',
    colorName: 'Saffron Red'
  },
  {
    url: 'https://images.unsplash.com/photo-1638256705240-9254c4e7a6ea',
    type: 'landscape',
    colorName: 'Desert Orange'
  },
  {
    url: 'https://bernardmarr.com/img/What%20Is%20Blue%20Ocean%20Strategy%20And%20How%20Can%20You%20Create%20One.png',
    type: 'outcome',
    colorName: 'Ocean Blue'
  },
  {
    url: 'https://media.post.rvohealth.io/wp-content/uploads/2020/09/sliced-lemons-thumb-732x549.jpg',
    type: 'outcome',
    colorName: 'Citrus Yellow'
  }
];

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  for (const image of images) {
    try {
      // Find the color
      const color = await prisma.color.findFirst({
        where: { name: image.colorName }
      });

      if (!color) {
        console.error(`Color ${image.colorName} not found`);
        continue;
      }

      // Download the image
      console.log(`Downloading image for ${image.colorName}...`);
      const imageBuffer = await downloadImage(image.url);

      // Create media upload
      await prisma.mediaUpload.create({
        data: {
          filename: `${image.colorName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          mimetype: 'image/jpeg',
          type: image.type,
          data: imageBuffer,
          colorId: color.id
        }
      });

      console.log(`Successfully stored image for ${image.colorName}`);
    } catch (error) {
      console.error(`Error processing ${image.colorName}:`, error);
    }
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