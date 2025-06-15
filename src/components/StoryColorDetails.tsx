"use client";

import { useEffect, useState } from "react";
import { ColorDetailsClient } from "@/app/colors/[id]/ColorDetailsClient";
import { SessionProvider } from 'next-auth/react';

export default function StoryColorDetails({ colorId }: { colorId: string }) {
  const [color, setColor] = useState<any>(null);
  const [mediaUploads, setMediaUploads] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetch(`/api/colors/${colorId}/full`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch color details");
        const data = await res.json();
        if (isMounted) {
          setColor(data.color);
          setMediaUploads(data.mediaUploads || []);
          setSession(data.session || null);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [colorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-[#2C3E50] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (error || !color) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500 font-mono">{error || "Color not found"}</p>
      </div>
    );
  }
  return (
    <SessionProvider>
      <ColorDetailsClient color={color} mediaUploads={mediaUploads} session={session} />
    </SessionProvider>
  );
} 