'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import ColorSubmissionForm from './ColorSubmissionForm';

interface ColorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ColorDialog({ isOpen, onOpenChange }: ColorDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[800px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-bold">
              Submit a New Color
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-1.5 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <ColorSubmissionForm onSuccess={() => onOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 