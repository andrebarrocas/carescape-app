import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/colors');
  return null;
}
