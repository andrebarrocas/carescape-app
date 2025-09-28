'use client';

import { useState, useEffect } from 'react';
import Map from '@/components/Map';
import { ColorSubmission } from '@/types/colors';

export default function ClientHomePage() {
  const [colors, setColors] = useState<ColorSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchColors = async () => {
    try {
      const response = await fetch('/api/public/colors');
      if (response.ok) {
        const data = await response.json();
        setColors(data);
      }
    } catch (error) {
      console.error('Error fetching colors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const handleRefresh = () => {
    console.log('Refreshing colors...');
    fetchColors();
  };

  if (loading) {
    return (
      <div className="w-screen h-screen overflow-hidden flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2C3E50] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      <Map colors={colors} onRefresh={handleRefresh} />
    </div>
  );
}
