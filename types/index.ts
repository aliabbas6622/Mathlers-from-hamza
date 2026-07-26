import { UserRole } from '@/models/User';

declare module 'next-auth' {
  interface User {
    id: string;
    role: UserRole;
    playerId: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      playerId: string;
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    playerId: string;
  }
}
