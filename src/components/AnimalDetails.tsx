'use client';

import { useState } from 'react';
import Image from 'next/image';
import { animals } from '@/data/animals';

interface AnimalDetailsProps {
  animalId: string;
}

export default function AnimalDetails({ animalId }: AnimalDetailsProps) {
  const animalData = animals.find(a => a.id === animalId) || animals[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Image */}
      <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src={animalData.image}
            alt={animalData.name}
            fill
            style={{ objectFit: 'cover' }}
            priority
            sizes="(max-width: 600px) 100vw, 600px"
            onError={(e) => {
              // Fallback to a colored background if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.style.backgroundColor = '#FF6B6B';
                parent.innerHTML = `<div class="flex items-center justify-center w-full h-full text-white text-2xl font-bold">${animalData.name}</div>`;
              }
            }}
          />
        </div>
      </div>

      {/* Title and Type */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{animalData.name}</h1>
        <p className="text-gray-600 italic">{animalData.scientificName}</p>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p className="text-gray-700">{animalData.description}</p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Habitat</h3>
          <p className="text-gray-700">{animalData.habitat}</p>
        </div>
        <div>
          <h3 className="font-semibold">Type</h3>
          <p className="text-gray-700">{animalData.type}</p>
        </div>
        <div>
          <h3 className="font-semibold">Diet</h3>
          <p className="text-gray-700">{animalData.diet}</p>
        </div>
        <div>
          <h3 className="font-semibold">Location</h3>
          <p className="text-gray-700">{animalData.location}</p>
        </div>
      </div>

      {/* Behavior */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Behavior</h2>
        <p className="text-gray-700">{animalData.behavior}</p>
      </div>

      {/* Conservation Status */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Conservation Status</h2>
        <p className="text-gray-700">{animalData.conservation}</p>
      </div>

      {/* Date Observed */}
      <div className="text-sm text-gray-500">
        Observed on: {new Date(animalData.date).toLocaleDateString()}
      </div>
    </div>
  );
} 