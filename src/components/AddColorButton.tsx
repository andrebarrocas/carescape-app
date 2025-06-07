'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import ColorSubmissionForm from './ColorSubmissionForm';

interface AddColorButtonProps {
  onSubmit: (data: any) => Promise<void>;
}

export default function AddColorButton({ onSubmit }: AddColorButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting color:', error);
      throw error;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow duration-200"
      >
        <Plus className="w-6 h-6" />
      </button>

      <ColorSubmissionForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
} 