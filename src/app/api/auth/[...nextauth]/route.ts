import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || 'localhost',
        port: process.env.EMAIL_SERVER_PORT || 1025,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM || 'noreply@example.com',
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Set pseudonym as email username if not set
        if (!user.pseudonym) {
          await prisma.user.update({
            where: { id: user.id },
            data: { pseudonym: user.email?.split('@')[0] || 'Anonymous' },
          });
        }
        session.user.pseudonym = user.pseudonym || user.email?.split('@')[0] || 'Anonymous';
      }
      return session;
    },
  },
})

export { handler as GET, handler as POST }; 