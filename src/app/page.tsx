import Map from '@/components/Map';
import { getColors } from '@/lib/colors';

export default async function HomePage() {
  const colors = await getColors();

  return (
    <div className="w-screen h-screen">
      <Map colors={colors} />
    </div>
  );
}
