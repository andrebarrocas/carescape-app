'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import ColorSubmissionForm, { ColorSubmissionForm as ColorSubmissionFormType } from './ColorSubmissionForm';

interface AddColorButtonProps {
  onSubmit: (data: ColorSubmissionFormType) => Promise<void>;
}

export default function AddColorButton({ onSubmit }: AddColorButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data: ColorSubmissionFormType) => {
    try {
      await onSubmit(data);
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting color:', error);
      // Show error message to user
      alert('Failed to submit color. Please try again.');
      throw error;
    }
  };

  const openModal = () => {
    setIsOpen(true);
  };

  return (
    <>
      <button
        onClick={openModal}
        className="group relative bg-[#2C3E50] hover:bg-[#FFFCF5] text-[#FFFCF5] hover:text-[#2C3E50] border-2 border-[#2C3E50] p-4 transition-all duration-200 flex items-center space-x-3"
      >
        <div className="relative">
          <Plus className="w-5 h-5" />
          <div className="absolute -inset-1 border border-[#2C3E50] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="font-mono text-sm tracking-wide">Add Color</span>
      </button>

      <ColorSubmissionForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
} 