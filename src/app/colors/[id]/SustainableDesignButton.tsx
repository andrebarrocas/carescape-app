"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Palette, X } from "lucide-react";
import PigmentAnalysis from "@/components/PigmentAnalysis";

interface SustainableDesignButtonProps {
  color: string;
  hex: string;
  location: string;
  materials: string;
  date: string;
  season: string;
  bioregion: string;
}

export default function SustainableDesignButton(props: SustainableDesignButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2C3E50]/10 hover:bg-[#2C3E50]/20 transition-colors"
        >
          <Palette className="w-4 h-4 text-[#2C3E50]" />
          <span className="font-handwritten text-[#2C3E50]">Sustainable Design</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-0 right-0 h-full w-full md:w-[420px] z-50 bg-white shadow-2xl flex flex-col p-8 overflow-y-auto border-l-4 border-black" style={{fontFamily:'Caveat, cursive'}}>
          <Dialog.Title>Sustainable Design Chat</Dialog.Title>
          <button className="absolute top-4 right-4 text-[#2C3E50] hover:text-[#2C3E50]/80" onClick={() => setOpen(false)}><X className="w-5 h-5" strokeWidth={1.2} /></button>
          <PigmentAnalysis {...props} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 