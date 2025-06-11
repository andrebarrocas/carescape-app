'use client';

import { Pencil } from 'lucide-react';

export function EditButton() {
  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit button clicked');
  };

  return (
    <button
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2C3E50]/10 hover:bg-[#2C3E50]/20 transition-colors"
      onClick={handleEdit}
    >
      <Pencil className="w-4 h-4 text-[#2C3E50]" />
      <span className="font-handwritten text-[#2C3E50]">Edit</span>
    </button>
  );
} 