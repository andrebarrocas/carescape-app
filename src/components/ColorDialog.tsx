'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import ColorSubmissionForm from './ColorSubmissionForm';

interface ColorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ColorDialog({ isOpen, onOpenChange }: ColorDialogProps) {
  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit color');
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting color:', error);
      throw error;
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={() => {}}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[800px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg overflow-y-auto border-2 border-black">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-bold text-black">
              Submit a New Color
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-1.5 hover:bg-black/5" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5 text-black" />
            </Dialog.Close>
          </div>
          <ColorSubmissionForm
            isOpen={isOpen}
            onClose={() => onOpenChange(false)}
            onSubmit={handleSubmit}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 