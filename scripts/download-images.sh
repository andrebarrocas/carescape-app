#!/bin/bash

# Create the art directory if it doesn't exist
mkdir -p public/images/art

# Download vintage-style images
curl -L "https://images.unsplash.com/photo-1596367407372-96cb88503db6?w=800&q=80" -o public/images/art/vintage-colors.jpg
curl -L "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80" -o public/images/art/vintage-pencils.jpg
curl -L "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80" -o public/images/art/vintage-palette.jpg
curl -L "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?w=800&q=80" -o public/images/art/vintage-art.jpg 