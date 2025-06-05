import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      pseudonym?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
  interface User {
    id: string;
    pseudonym?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
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
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user?.password) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          pseudonym: user.pseudonym || undefined,
          name: null,
          image: null,
        };
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
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