import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MenuAndBreadcrumbs from '@/components/MenuAndBreadcrumbs';
import { AnimalsClient } from './AnimalsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AnimalsPage() {
  const session = await getServerSession(authOptions);
  
  const animals = await prisma.animal.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <main className="min-h-screen bg-[#FFFCF5]">
      <MenuAndBreadcrumbs />
      <div className="container mx-auto px-4 py-8">
        <AnimalsClient animals={animals} session={session} />
      </div>
    </main>
  );
} 