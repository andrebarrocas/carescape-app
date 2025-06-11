'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Comment, MediaUploadWithComments } from '@/app/colors/[id]/types';

interface CommentsModalProps {
  media: MediaUploadWithComments;
  onClose: () => void;
  onAddComment: (mediaId: string, content: string) => Promise<void>;
}

export function CommentsModal({ media, onClose, onAddComment }: CommentsModalProps) {
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(media.id, newComment.trim());
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-semibold text-[#2C3E50]">
            {media.caption || 'Image Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#2C3E50] hover:text-[#2C3E50]/80 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Image Section */}
          <div className="w-full md:w-2/3 relative bg-black flex items-center">
            <div className="relative w-full aspect-square">
              <Image
                src={`/api/images/${media.id}`}
                alt={media.caption || 'Image'}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
            </div>
          </div>

          {/* Comments Section */}
          <div className="w-full md:w-1/3 flex flex-col h-full border-l">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {media.comments.length === 0 ? (
                <p className="text-[#2C3E50]/60 italic text-center mt-4">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                <div className="space-y-4">
                  {media.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        {comment.user.image ? (
                          <Image
                            src={comment.user.image}
                            alt={comment.user.name || 'User'}
                            width={28}
                            height={28}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#2C3E50] text-white flex items-center justify-center text-sm">
                            {(comment.user.name?.[0] || 'A').toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-[#2C3E50]">
                            {comment.user.name || 'Anonymous'}
                          </span>
                          <p className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <p className="text-[#2C3E50] ml-9">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2C3E50]/20"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="bg-[#2C3E50] text-white px-4 py-2 rounded-lg hover:bg-[#2C3E50]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 