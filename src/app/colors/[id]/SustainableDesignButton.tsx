"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
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
          className="bos-button text-2xl px-8 py-3"
          style={{ lineHeight: 1.1 }}
        >
          <span>Design Ideas</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full md:w-[500px] max-w-full z-50 bg-white shadow-2xl rounded-t-2xl flex flex-col p-8 overflow-y-auto border-t-4 border-black" style={{fontFamily:'Caveat, cursive', maxHeight: '80vh'}}>
          <Dialog.Title asChild>
            <div className="flex items-center gap-2 mb-4">
              
              <span className="font-mono text-base text-[#2C3E50]/80">Design Ideas</span>
            </div>
          </Dialog.Title>
          <button className="absolute top-4 right-4 text-[#2C3E50] hover:text-[#2C3E50]/80" onClick={() => setOpen(false)}><X className="w-5 h-5" strokeWidth={1.2} /></button>
          <PigmentAnalysis {...props} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 