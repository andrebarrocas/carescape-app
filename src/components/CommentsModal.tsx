'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { format } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    image?: string;
  };
}

interface Media {
  id: string;
  caption?: string;
  url: string;
  type: string;
  comments: Comment[];
}

interface CommentsModalProps {
  media: Media;
  onClose: () => void;
  onAddComment: (mediaId: string) => Promise<void>;
}

export function CommentsModal({ media, onClose, onAddComment }: CommentsModalProps) {
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!session?.user || !newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAddComment(media.id);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-handwriting text-2xl">
              {media.caption || 'Image Comments'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              ×
            </button>
          </div>

          <Image
            src={media.url}
            alt={media.caption || 'Selected image'}
            width={800}
            height={600}
            className="w-full h-auto object-contain mb-6"
            unoptimized={true}
          />

          <div className="space-y-4">
            <h4 className="font-handwriting text-xl">Comments</h4>
            
            {media.comments.map(comment => (
              <div key={comment.id} className="border-b border-gray-200 pb-4">
                <div className="flex items-start gap-2">
                  {comment.user.image && (
                    <Image
                      src={comment.user.image}
                      alt={comment.user.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                      unoptimized={true}
                    />
                  )}
                  <div>
                    <p className="font-handwriting font-bold">
                      {comment.user.name}
                    </p>
                    <p className="font-handwriting">{comment.content}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {session?.user && (
              <div className="mt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-2 border border-gray-200 rounded font-handwriting"
                  rows={3}
                  disabled={isSubmitting}
                />
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`mt-2 px-4 py-2 rounded font-handwriting transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {isSubmitting ? 'Adding Comment...' : 'Add Comment'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 