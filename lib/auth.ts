import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validations/auth";
import { createAuditLog } from "@/lib/security/audit";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials, req) {
        const ip =
          req?.headers?.["x-forwarded-for"] ??
          req?.headers?.["x-real-ip"] ??
          "unknown";

        try {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) {
            await logFailedLogin(undefined, ip as string, "Invalid input");
            return null;
          }

          const { email, password } = parsed.data;

          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });

          if (!user || !user.password || !user.isActive) {
            await logFailedLogin(user?.id, ip as string, "User not found or inactive");
            return null;
          }

          const passwordValid = await bcrypt.compare(password, user.password);
          if (!passwordValid) {
            await logFailedLogin(user.id, ip as string, "Invalid password");
            return null;
          }

          // Log successful login
          await prisma.loginHistory.create({
            data: {
              userId: user.id,
              ipAddress: ip as string,
              success: true,
            },
          });

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          await createAuditLog({
            userId: user.id,
            action: "LOGIN",
            resource: "auth",
            ipAddress: ip as string,
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

async function logFailedLogin(
  userId: string | undefined,
  ipAddress: string,
  reason: string
) {
  if (userId) {
    await prisma.loginHistory.create({
      data: { userId, ipAddress, success: false, failReason: reason },
    });
  }
}
