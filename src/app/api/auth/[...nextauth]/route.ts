import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { Session } from 'next-auth';

interface ExtendedSession extends Session {
  user: {
    id?: string;
    pseudonym?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await dbConnect();
          
          // Check if user exists
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user
            await User.create({
              email: user.email,
              pseudonym: user.name || user.email?.split('@')[0] || 'Anonymous',
            });
          }
          
          return true;
        } catch (error) {
          console.error('Error during sign in:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session }): Promise<ExtendedSession> {
      const extendedSession = session as ExtendedSession;
      
      try {
        await dbConnect();
        const user = await User.findOne({ email: extendedSession.user?.email });
        if (user && extendedSession.user) {
          extendedSession.user.id = user._id.toString();
          extendedSession.user.pseudonym = user.pseudonym;
        }
      } catch (error) {
        console.error('Error getting session:', error);
      }
      return extendedSession;
    },
  },
});

export { handler as GET, handler as POST }; 