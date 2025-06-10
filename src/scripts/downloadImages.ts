import fs from 'fs/promises';
import path from 'path';

async function downloadImage(url: string, outputPath: string) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(outputPath, buffer);
    console.log(`Downloaded ${url} to ${outputPath}`);
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
  }
}

async function downloadImages() {
  const images = [
    {
      url: "https://images.unsplash.com/photo-1528821128474-27f963b062bf",
      filename: "lemon-grove.jpg"
    },
    {
      url: "https://images.unsplash.com/photo-1582087463261-ddea03f80e5d",
      filename: "lemon-zest.jpg"
    },
    {
      url: "https://images.unsplash.com/photo-1582087463261-ddea03f80e5d",
      filename: "lemon-cross-section.jpg"
    }
  ];

  for (const image of images) {
    const outputPath = path.join(process.cwd(), "public", "images", image.filename);
    await downloadImage(image.url, outputPath);
  }
}

downloadImages(); 