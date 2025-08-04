// next-auth.d.ts
import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Extend the built-in 'User' type
declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string;      // Your existing 'id' property
    role?: string;   // The new 'role' property
  }

  // Extend the built-in 'Session' type
  interface Session {
    user: {
      id: string;    // Your existing 'id' property
      role?: string; // The new 'role' property
    } & DefaultSession['user'];
  }
}

// Extend the built-in 'JWT' type
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;      // Your existing 'id' property
    role?: string;   // The new 'role' property
  }
}
