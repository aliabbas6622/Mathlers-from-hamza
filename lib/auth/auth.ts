import NextAuth from 'next-auth';
import type { Session, User } from 'next-auth';
import type { JWT } from '@auth/core/jwt';
import Credentials from 'next-auth/providers/credentials';
import UserModel, { UserRole } from '@/models/User';
import connectDB from '@/lib/db/mongodb';
import bcrypt from 'bcryptjs';

async function getBypassUser(bypassRole: 'student' | 'admin') {
  await connectDB();
  const role = bypassRole === 'admin' ? UserRole.ADMIN : UserRole.STUDENT;
  const email = `${bypassRole}@mathlers.local`;
  const playerId = bypassRole === 'admin' ? 'ADM-BYPASS' : 'MTH-BYPASS';

  return UserModel.findOneAndUpdate(
    { email },
    {
      $setOnInsert: {
        fullName: bypassRole === 'admin' ? 'Bypass Admin' : 'Bypass Student',
        fatherName: 'Development Bypass',
        dateOfBirth: new Date('2010-01-01'),
        gender: 'other',
        email,
        phone: '0000000000',
        password: 'development-bypass',
        city: 'Development',
        grade: '12',
        role,
        playerId,
        isEmailVerified: true,
      },
    },
    { returnDocument: 'after', upsert: true }
  );
}

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
          const user = await getBypassUser(bypassRole);

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName,
            role: user.role,
            playerId: user.playerId,
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
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.playerId = user.playerId;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        if (
          process.env.NODE_ENV !== 'production' &&
          (token.id === 'bypass-student' || token.id === 'bypass-admin')
        ) {
          const bypassRole = token.id === 'bypass-admin' ? 'admin' : 'student';
          const user = await getBypassUser(bypassRole);
          token.id = user._id.toString();
          token.role = user.role;
          token.playerId = user.playerId;
        }

        session.user.id = token.id;
        session.user.role = token.role;
        session.user.playerId = token.playerId;
      }
      return session;
    },
  },
});
