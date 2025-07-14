import { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === 'development',
  useSecureCookies: false,
  secret: process.env.NEXTAUTH_SECRET,
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
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Missing credentials');
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user?.password) {
            throw new Error('User not found');
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user.id,
            email: user.email,
            pseudonym: user.pseudonym || undefined,
            name: null,
            image: null,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token, user }) {
      try {
        if (session.user) {
          session.user.id = token.sub || user.id;
          
          // Only fetch user data if we don't have pseudonym in token
          if (!(token as any).pseudonym && !(token as any).name) {
            const dbUser = await prisma.user.findUnique({
              where: { id: session.user.id },
              select: { pseudonym: true, email: true, name: true },
            });
            
            if (dbUser?.pseudonym) {
              session.user.pseudonym = dbUser.pseudonym;
            } else if (dbUser?.name) {
              session.user.name = dbUser.name;
            } else if (dbUser?.email && dbUser.email !== 'anonymous@carespace.app') {
              session.user.pseudonym = dbUser.email.split('@')[0];
            }
          } else {
            // Use cached data from token
            session.user.pseudonym = (token as any).pseudonym;
            session.user.name = (token as any).name;
          }
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Store user data in token for caching
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { pseudonym: true, email: true, name: true },
        });
        
        if (dbUser?.pseudonym) {
          (token as any).pseudonym = dbUser.pseudonym;
        } else if (dbUser?.name) {
          (token as any).name = dbUser.name;
        } else if (dbUser?.email && dbUser.email !== 'anonymous@carespace.app') {
          (token as any).pseudonym = dbUser.email.split('@')[0];
        }
      }
      return token;
    },
  },
}; 