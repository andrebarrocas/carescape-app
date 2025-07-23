"use client";

import { useEffect, useState, Suspense } from "react";
import { ColorDetailsClient } from "@/app/colors/[id]/ColorDetailsClient";
import { SessionProvider } from 'next-auth/react';

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 border-4 border-[#2C3E50] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Error component
function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-red-500 font-mono">{error}</p>
    </div>
  );
}

// Progressive loading component
function ProgressiveLoader({ colorId }: { colorId: string }) {
  const [color, setColor] = useState<any>(null);
  const [mediaUploads, setMediaUploads] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    
    // Fetch full data with comments
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/colors/${colorId}/full`);
        if (!res.ok) throw new Error("Failed to fetch color details");
        const data = await res.json();
        if (isMounted) {
          setColor(data.color);
          setMediaUploads(data.mediaUploads || []);
          setSession(data.session || null);
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [colorId]);

  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error || !color) {
    return <ErrorDisplay error={error || "Color not found"} />;
  }
  
  return (
    <SessionProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <ColorDetailsClient color={color} mediaUploads={mediaUploads} session={session} />
      </Suspense>
    </SessionProvider>
  );
}

export default function StoryColorDetails({ colorId }: { colorId: string }) {
  return <ProgressiveLoader colorId={colorId} />;
} 