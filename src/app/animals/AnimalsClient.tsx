'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Animal } from '@/types/animals';
import AnimalSubmissionForm from '@/components/AnimalSubmissionForm';

interface BiodiversityClientProps {
  animals: Animal[];
  session: any;
}

export function BiodiversityClient({ animals, session }: BiodiversityClientProps) {
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/animals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit animal');
      }

      router.refresh();
      setIsAddAnimalOpen(false);
    } catch (error) {
      console.error('Error submitting animal:', error);
      alert('Failed to submit animal. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-serif text-[#2C3E50]">Biodiversity</h1>
        <button
          onClick={() => setIsAddAnimalOpen(true)}
          className="bos-button flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#2C3E50]" strokeWidth={1.2} />
          <span>Add Animal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {animals.map((animal) => (
          <div
            key={animal.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 cursor-pointer"
            onClick={() => router.push(`/animals/${animal.id}`)}
          >
            <div className="relative aspect-square">
              <Image
                src={animal.image}
                alt={animal.name}
                fill
                className="object-cover"
                onError={(e) => {
                  // Fallback to a colored background if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.backgroundColor = '#FF6B6B';
                    parent.innerHTML = `<div class="flex items-center justify-center w-full h-full text-white text-2xl font-bold">${animal.name}</div>`;
                  }
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-serif text-2xl tracking-wide text-[#2C3E50] border-b-2 border-[#2C3E50] inline-block pb-1">
                {animal.name}
              </h3>
              <p className="font-mono text-xs text-[#2C3E50] mt-3 opacity-80">
                {animal.type}
              </p>
              <p className="font-mono text-xs text-[#2C3E50] opacity-80">
                {animal.location}
              </p>
            </div>
          </div>
        ))}
      </div>

      <AnimalSubmissionForm
        isOpen={isAddAnimalOpen}
        onClose={() => setIsAddAnimalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
} 