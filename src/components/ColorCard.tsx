import { useState } from 'react';
import { X } from 'lucide-react';
import ColorPlaceholder from './ColorPlaceholder';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog } from '@/components/ui/AlertDialog';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Material {
  id: string;
  name: string;
}

interface Process {
  id: string;
  application: string;
  technique: string;
}

interface MediaUpload {
  url: string;
  type: string;
}

interface Color {
  id: string;
  name: string;
  hex: string;
  location: string;
  materials: Material[];
  processes: Process[];
  mediaUploads: MediaUpload[];
}

interface ColorCardProps {
  color: Color;
  onDelete: (id: string) => void;
}

export default function ColorCard({ color, onDelete }: ColorCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const getDisplayImage = () => {
    if (!color.mediaUploads || !Array.isArray(color.mediaUploads) || color.mediaUploads.length === 0) {
      return null;
    }

    // Try to find a landscape image first
    const landscapeImage = color.mediaUploads.find(m => m.type === 'landscape' && m.url);
    
    // If no landscape image found, use any image
    return landscapeImage?.url || color.mediaUploads[0]?.url || null;
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/colors/${color.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete color');
      }

      onDelete(color.id);
      toast({
        title: 'Success',
        description: 'Color deleted successfully',
      });
      router.refresh();
    } catch (error) {
      console.error('Error deleting color:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete color',
        variant: 'destructive',
      });
    }
  };

  const displayImage = getDisplayImage();

  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 group relative cursor-pointer"
        onClick={() => router.push(`/colors/${color.id}`)}
      >
        <div className="relative aspect-square">
          {/* Delete button - visible on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-[#2C3E50]/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <X className="w-4 h-4 text-[#2C3E50]" strokeWidth={1.2} />
          </button>
          
          {displayImage && !imageError ? (
            <div className="relative w-full h-full">
              <Image
                src={displayImage}
                alt={color.name}
                fill
                className="object-cover rounded-t-xl"
                onError={() => setImageError(true)}
                priority
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: color.hex,
                  opacity: 0.1,
                  mixBlendMode: 'multiply'
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full">
              <ColorPlaceholder hex={color.hex} name={color.name} />
            </div>
          )}
          <div
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full shadow-lg border-4 border-white"
            style={{ backgroundColor: color.hex }}
          />
        </div>
        <div className="p-4">
          <h3 className="font-serif text-2xl tracking-wide text-[#2C3E50] border-b-2 border-[#2C3E50] inline-block pb-1">{color.name}</h3>
          <p className="font-mono text-xs text-[#2C3E50] mt-3 opacity-80">
            {color.materials.map(m => m.name).join(', ')}
          </p>
          <p className="font-mono text-xs text-[#2C3E50] opacity-80">{color.location}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {color.processes.map(p => (
              <span
                key={p.id}
                className="inline-block px-2 py-1 text-xs font-mono bg-[#FFFCF5] text-[#2C3E50] border-2 border-[#2C3E50]"
              >
                {p.technique.charAt(0).toUpperCase() + p.technique.slice(1)} - {p.application}
              </span>
            ))}
          </div>
        </div>
      </div>

      <AlertDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Color"
        description={`Are you sure you want to delete "${color.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
} 