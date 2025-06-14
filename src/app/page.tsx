import Map from '@/components/Map';
import { headers } from 'next/headers';

async function fetchColors() {
  let host = '';
  let protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  try {
    const headersList = await headers();
    host = headersList.get('host') || 'localhost:3000';
  } catch {
    host = process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, '') || 'localhost:3000';
  }
  if (!host) host = process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, '') || 'localhost:3000';
  const url = `${protocol}://${host}/api/colors`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function HomePage() {
  const colors = await fetchColors();
  return (
    <div className="w-screen h-screen overflow-hidden">
      <Map colors={colors} titleColor="whitesmoke" />
    </div>
  );
}
