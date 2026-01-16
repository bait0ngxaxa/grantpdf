// next-auth.d.ts
import "next-auth";
import "next-auth/jwt";
import { type DefaultSession, type DefaultUser } from "next-auth";

// Extend the built-in 'User' type
declare module "next-auth" {
    interface User extends DefaultUser {
        id: string;
        role?: string;
    }

    interface Session {
        user: {
            id: string;
            role?: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role?: string;
    }
}
