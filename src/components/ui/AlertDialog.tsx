import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cn } from '@/lib/utils';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Continue',
  cancelText = 'Cancel',
  variant = 'default',
}: AlertDialogProps) {
  return (
    <AlertDialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <AlertDialogPrimitive.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[90vw] max-w-md shadow-xl">
          <AlertDialogPrimitive.Title className="text-xl font-semibold mb-2">
            {title}
          </AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="text-gray-600 mb-6">
            {description}
          </AlertDialogPrimitive.Description>
          <div className="flex justify-end gap-3">
            <AlertDialogPrimitive.Cancel asChild>
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-md"
                onClick={onClose}
              >
                {cancelText}
              </button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <button
                className={cn(
                  "px-4 py-2 text-white rounded-md",
                  variant === 'destructive' 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 hover:opacity-90"
                )}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {confirmText}
              </button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
} 