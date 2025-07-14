'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface LikeButtonProps {
  colorId: string;
  initialLikesCount?: number;
  initialIsLiked?: boolean;
}

export function LikeButton({ colorId, initialLikesCount = 0, initialIsLiked = false }: LikeButtonProps) {
  const { data: session } = useSession();
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch like status if we have initial values
    if (initialLikesCount === 0 && initialIsLiked === false) {
      const fetchLikeStatus = async () => {
        try {
          const response = await fetch(`/api/colors/${colorId}/likes`);
          if (response.ok) {
            const data = await response.json();
            setLikesCount(data.likesCount);
            setIsLiked(data.isLiked);
          }
        } catch (error) {
          console.error('Error fetching like status:', error);
        }
      };

      fetchLikeStatus();
    }
  }, [colorId, initialLikesCount, initialIsLiked]);

  const handleLikeToggle = async () => {
    if (!session?.user?.id) {
      // Redirect to sign in or show a message
      alert('Please sign in to like colors');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/colors/${colorId}/likes`, {
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
        console.error('Failed to toggle like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLikeToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ${
        isLiked
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={isLiked ? 'Unlike this color' : 'Like this color'}
    >
      <Heart
        className={`w-5 h-5 transition-all duration-200 ${
          isLiked ? 'fill-current' : 'stroke-current fill-none'
        }`}
      />
      <span className="text-sm font-medium">{likesCount}</span>
    </button>
  );
} 