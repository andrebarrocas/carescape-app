'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Comment, MediaUploadWithComments } from '@/app/colors/[id]/types';
import { X } from 'lucide-react';

interface CommentsModalProps {
  media: MediaUploadWithComments;
  onClose: () => void;
  onAddComment: (mediaId: string, content: string) => Promise<void>;
}

export function CommentsModal({ media, onClose, onAddComment }: CommentsModalProps) {
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState(media.comments);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(media.id, newComment.trim());
      // Optimistically add the comment to the list
      setComments(prev => [
        {
          id: Math.random().toString(36).substr(2, 9),
          content: newComment.trim(),
          createdAt: new Date().toISOString(),
          user: {
            name: session?.user?.name || 'You',
            image: session?.user?.image || null
          }
        },
        ...prev
      ]);
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full border border-[#2C3E50]/10 shadow-2xl p-4 md:p-6 flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute -top-6 right-6 bg-black text-white rounded-full p-2 shadow-lg hover:bg-[#2C3E50] transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" strokeWidth={1.2} />
        </button>
        {/* Header */}
        <div className="w-full text-center mb-8">
          <h2 className="text-1xl text-[#2C3E50] mb-2">{media.caption || 'Image Details'}</h2>
         
        </div>

        <div className="flex flex-col md:flex-row flex-1 w-full gap-2 md:gap-4">
          {/* Image Section */}
          <div className="w-full md:w-1/2 flex items-center justify-center md:pr-2">
            <div className="relative w-full h-[220px] md:h-[340px] rounded-xl overflow-hidden shadow-lg border border-[#2C3E50]/10">
              <Image
                src={`/api/images/${media.id}`}
                alt={media.caption || 'Image'}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Comments Section */}
          <div className="w-full md:w-1/2 flex flex-col h-full border-t md:border-t-0 md:border-l border-[#2C3E50]/10">
            <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4">
              {comments.length === 0 ? (
                <p className="text-[#2C3E50]/60 italic text-center mt-4">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
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
            <form onSubmit={handleSubmit} className="p-2 md:p-0 border-t md:border-t-0 bg-gray-50 w-full">
              <div className="flex flex-col gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full border rounded-lg px-3 py-2 min-h-[70px] max-h-[160px] resize-vertical focus:outline-none focus:ring-2 focus:ring-[#2C3E50]/20 font-mono text-base"
                  disabled={isSubmitting}
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="bos-button disabled:opacity-50 disabled:cursor-not-allowed"
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
