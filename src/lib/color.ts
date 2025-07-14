import ColorThief from 'color-thief-ts';

export const extractDominantColor = async (imageUrl: string): Promise<string> => {
  try {
    const colorThief = new ColorThief();
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          const color = colorThief.getColor(img);
          const hex = rgbToHex(color[0], color[1], color[2]);
          resolve(hex);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        reject(error);
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Error extracting color:', error);
    throw error;
  }
};

export const extractColorPalette = async (
  imageUrl: string,
  colorCount: number = 5
): Promise<string[]> => {
  try {
    const colorThief = new ColorThief();
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          const palette = colorThief.getPalette(img, colorCount);
          const hexColors = palette.map((color: [number, number, number]) =>
            rgbToHex(color[0], color[1], color[2])
          );
          resolve(hexColors);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        reject(error);
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Error extracting palette:', error);
    throw error;
  }
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}; 