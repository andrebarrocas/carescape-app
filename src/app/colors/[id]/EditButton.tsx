'use client';

import { Pencil } from 'lucide-react';

export function EditButton() {
  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit button clicked');
  };

  return (
    <button
      className="bos-button flex items-center gap-2"
      onClick={handleEdit}
    >
      <Pencil className="w-4 h-4" />
      <span>Edit</span>
    </button>
  );
} 