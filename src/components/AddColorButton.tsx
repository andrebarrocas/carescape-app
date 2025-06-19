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
        className="bos-button flex items-center gap-2"
      >
        <Plus className="w-4 h-4 text-[#2C3E50]" strokeWidth={1.2} />
        <span>Add Color</span>
      </button>

      <ColorSubmissionForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
} 