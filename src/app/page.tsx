import { redirect } from 'next/navigation';
import Map from '@/components/Map';
import { getColors } from '@/lib/colors';

export default function HomePage() {
  redirect('/colors');
  return null;
}
