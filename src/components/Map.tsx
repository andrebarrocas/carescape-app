'use client';

import { useEffect, useState } from 'react';
import { Map as PigeonMap, Marker } from 'pigeon-maps';
import { ColorSubmission, ColorType } from '@/types/colors';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

interface ColorMapProps {
  selectedTypes: ColorType[];
  onMarkerClick: (color: ColorSubmission) => void;
}

export default function ColorMap({ selectedTypes, onMarkerClick }: ColorMapProps) {
  const [colors, setColors] = useState<ColorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  useEffect(() => {
    async function fetchColors() {
      try {
        const { data, error } = await supabase
          .from('colors')
          .select('*')
          .in('process->type', selectedTypes);

        if (error) throw error;

        setColors(data as ColorSubmission[]);
      } catch (err) {
        console.error('Error fetching colors:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch colors');
      } finally {
        setLoading(false);
      }
    }

    fetchColors();
  }, [selectedTypes]);

  const getMarkerColor = (type: ColorType) => {
    switch (type) {
      case 'pigment':
        return '#EF4444'; // red-500
      case 'dye':
        return '#3B82F6'; // blue-500
      case 'ink':
        return '#22C55E'; // green-500
      default:
        return '#6B7280'; // gray-500
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <PigeonMap
      defaultCenter={[40, -74.5]}
      defaultZoom={9}
      attribution={false}
    >
      {colors.map((color) => (
        <Marker
          key={color.id}
          width={50}
          anchor={color.origin.coordinates}
          color={getMarkerColor(color.process.type)}
          onClick={() => onMarkerClick(color)}
        />
      ))}
    </PigeonMap>
  );
} 