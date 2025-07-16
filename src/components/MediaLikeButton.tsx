'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface MediaLikeButtonProps {
  mediaId: string;
  initialLikesCount?: number;
  initialIsLiked?: boolean;
}

export function MediaLikeButton({ mediaId, initialLikesCount = 0, initialIsLiked = false }: MediaLikeButtonProps) {
  const { data: session } = useSession();
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch like status if we have initial values
    if (initialLikesCount === 0 && initialIsLiked === false) {
      const fetchLikeStatus = async () => {
        try {
          const response = await fetch(`/api/media/${mediaId}/likes`);
          if (response.ok) {
            const data = await response.json();
            setLikesCount(data.likesCount);
            setIsLiked(data.isLiked);
          }
        } catch (error) {
          console.error('Error fetching media like status:', error);
        }
      };

      fetchLikeStatus();
    }
  }, [mediaId, initialLikesCount, initialIsLiked]);

  const handleLikeToggle = async () => {
    if (!session?.user?.id) {
      alert('Please sign in to like media');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/media/${mediaId}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLikesCount(data.likesCount);
        setIsLiked(data.isLiked);
      } else {
        console.error('Failed to toggle media like');
      }
    } catch (error) {
      console.error('Error toggling media like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLikeToggle}
      disabled={isLoading}
      className={`flex items-center gap-1 p-1 rounded-full transition-all duration-200 ${
        isLiked
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-500 hover:text-[#2C3E50]'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={isLiked ? 'Unlike this media' : 'Like this media'}
    >
      <Heart
        className={`w-4 h-4 transition-all duration-200 ${
          isLiked ? 'fill-current' : 'stroke-current fill-none'
        }`}
      />
      {likesCount > 0 && (
        <span className="text-xs font-medium">{likesCount}</span>
      )}
    </button>
  );
} 