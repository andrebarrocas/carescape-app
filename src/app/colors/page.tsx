import Map from '@/components/Map';
import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function fetchColors() {
  let host = '';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  try {
    const headersList = await headers();
    host = headersList.get('host') || 'localhost:3000';
  } catch {
    host = process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, '') || 'localhost:3000';
  }
  if (!host) host = process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, '') || 'localhost:3000';
  const url = `${protocol}://${host}/api/colors`;
  
  // Get cookies to pass authentication
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;
  
  const res = await fetch(url, { 
    cache: 'no-store',
    headers: {
      ...(authToken && { 'Cookie': `auth-token=${authToken}` })
    }
  });
  if (res.status === 401) return 'unauthorized';
  if (!res.ok) return [];
  return res.json();
}

export default async function ColorsPage() {
  const colors = await fetchColors();
  if (colors === 'unauthorized') {
    redirect('/auth/signin');
  }
  return (
    <div className="w-screen h-screen overflow-hidden">
      <Map colors={colors} />
    </div>
  );
} 