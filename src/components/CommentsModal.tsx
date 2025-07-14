'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Comment, MediaUploadWithComments } from '@/app/colors/[id]/types';
import { X, Reply, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CommentsModalProps {
  media: MediaUploadWithComments;
  onClose: () => void;
  onAddComment: (mediaId: string, content: string, parentId?: string) => Promise<void>;
}

export function CommentsModal({ media, onClose, onAddComment }: CommentsModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState(media.comments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Memoize the initial comments to prevent unnecessary state updates
  const initialComments = useMemo(() => media.comments, [media.comments]);

  // Helper to fetch latest comments for this media
  const fetchComments = useMemo(() => async () => {
    const res = await fetch(`/api/colors/${media.colorId}/comments`);
    if (res.ok) {
      const allComments = await res.json();
      // Filter for this media only
      setComments(allComments.filter((c: any) => c.mediaId === media.id));
    }
  }, [media.colorId, media.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(media.id, newComment.trim());
      setNewComment('');
      await fetchComments(); // Refresh comments in modal
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(media.id, replyContent.trim(), commentId);
      setReplyContent('');
      setReplyingTo(null);
      await fetchComments(); // Refresh comments in modal
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
          <h2 className="text-1xl text-[#2C3E50] mb-2 font-mono font-bold">
            {media.caption ? media.caption : 'Image Details'}
          </h2>
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
              <button className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow hover:bg-white">
                <Heart className="w-6 h-6 text-[#2C3E50]" strokeWidth={1.5} fill="none" />
              </button>
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
                        <div className="flex-1">
                          <span className="font-medium text-[#2C3E50]">
                            {comment.user.displayName || 'Anonymous'}
                          </span>
                          <p className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <button className="ml-2 p-1 rounded-full hover:bg-gray-100">
                          <Heart className="w-5 h-5 text-[#2C3E50]" strokeWidth={1.5} fill="none" />
                        </button>
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-gray-500 hover:text-[#2C3E50] transition-colors"
                          title="Reply"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[#2C3E50] ml-9 mb-2">{comment.content}</p>
                      
                      {/* Reply form */}
                      {replyingTo === comment.id && (
                        <div className="ml-9 mt-2">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full border rounded-lg px-3 py-2 min-h-[60px] max-h-[120px] resize-vertical focus:outline-none focus:ring-2 focus:ring-[#2C3E50]/20 font-mono text-sm"
                            rows={2}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleReply(comment.id)}
                              disabled={isSubmitting || !replyContent.trim()}
                              className="bg-[#2C3E50] text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                            >
                              Reply
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                              }}
                              className="text-gray-500 px-3 py-1 rounded text-sm hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Show replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-9 mt-3 space-y-2">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="bg-white rounded-lg p-2 shadow-sm border-l-2 border-[#2C3E50]/20">
                              <div className="flex items-center gap-2 mb-1">
                                {reply.user.image ? (
                                  <Image
                                    src={reply.user.image}
                                    alt={reply.user.name || 'User'}
                                    width={20}
                                    height={20}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-[#2C3E50] text-white flex items-center justify-center text-xs">
                                    {(reply.user.name?.[0] || 'A').toUpperCase()}
                                  </div>
                                )}
                                <span className="font-medium text-[#2C3E50] text-sm">
                                  {reply.user.displayName || 'Anonymous'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(reply.createdAt), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <p className="text-[#2C3E50] text-sm ml-7">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
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
                  style={{ fontSize: '1.5rem', padding: '0.75rem 2rem', fontWeight: 700, letterSpacing: '1px', width: '100%', marginTop: '0.5rem' }}
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
