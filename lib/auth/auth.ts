import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import UserModel, { UserRole } from '@/models/User';
import connectDB from '@/lib/db/mongodb';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'mathlers-secret-key-change-in-production',
  providers: [
    Credentials({
      async authorize(credentials) {
        const bypassRole = credentials?.bypassRole as string | undefined;

        if (process.env.NODE_ENV !== 'production' && (bypassRole === 'student' || bypassRole === 'admin')) {
          return {
            id: `bypass-${bypassRole}`,
            email: `${bypassRole}@mathlers.local`,
            name: bypassRole === 'admin' ? 'Bypass Admin' : 'Bypass Student',
            role: bypassRole === 'admin' ? UserRole.ADMIN : UserRole.STUDENT,
            playerId: bypassRole === 'admin' ? 'ADM-BYPASS' : 'MTH-BYPASS',
          };
        }

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();
          const user = await UserModel.findOne({ email: credentials.email as string });

          if (!user || !user.isActive || user.isSuspended) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName,
            role: user.role,
            playerId: user.playerId,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.playerId = user.playerId;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.playerId = token.playerId;
      }
      return session;
    },
  },
});
