import { useState } from 'react';
import { X } from 'lucide-react';
import ColorPlaceholder from './ColorPlaceholder';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog } from '@/components/ui/AlertDialog';

interface Material {
  id: string;
  name: string;
}

interface Process {
  id: string;
  application: string;
}

interface MediaUpload {
  url: string;
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
    } catch (error) {
      console.error('Error deleting color:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete color',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-200 group relative">
        <div className="relative aspect-square">
          {/* Delete button - visible on hover */}
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-red-50 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
          
          {color.mediaUploads && color.mediaUploads.length > 0 && !imageError ? (
            <div 
              className="w-full h-full bg-cover bg-center rounded-t-xl"
              style={{
                backgroundColor: color.hex,
                backgroundImage: `url(${color.mediaUploads[0].url})`,
              }}
              onError={() => setImageError(true)}
            />
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
          <h3 className="text-lg font-semibold text-gray-900">{color.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {color.materials.map(m => m.name).join(', ')}
          </p>
          <p className="text-sm text-gray-500">{color.location}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {color.processes.map(p => (
              <span
                key={p.id}
                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                {p.application}
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