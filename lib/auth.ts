import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDataBase } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { lable: "Email", type: "Email", placeholder: "Email" },
        password: {
          lable: "Password",
          type: "Password",
          placeholder: "Password",
        },
      },

      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid Credentails");
        }

        try {
          await connectToDataBase();
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("No user found with this email");
          }

          const isValid = bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Invalid Password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error", error);
          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      (session.user.id = token.id as string),
        (session.user.role = token.role as string);
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};
