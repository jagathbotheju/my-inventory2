import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
// import Github from "next-auth/providers/github";
// import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
// import { LoginSchema } from "./schema";
// import { compare } from "bcryptjs";
// import { users } from "@/server/db/schema";
import { User, users } from "@/server/db/schema/users";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),

    // Github({
    //   clientId: process.env.GITHUB_CLIENT_ID as string,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    //   allowDangerousEmailAccountLinking: true,
    // }),

    // Credentials({
    //   authorize: async (credentials) => {
    //     const validated = LoginSchema.safeParse(credentials);
    //     if (!validated.success) return null;

    //     const { email, password } = validated.data;
    //     const existStudent = await db.query.users.findFirst({
    //       where: eq(users.email, email),
    //     });

    //     if (!existStudent || existStudent.email !== email) return null;
    //     if (!existStudent || !existStudent.password) return null;
    //     const matchPassword = await compare(password, existStudent.password);
    //     if (!matchPassword) return null;

    //     return existStudent as User;
    //   },
    // }),
  ],
  callbacks: {
    async session({ token, session }) {
      const tokenUser = token.user as User;
      if (tokenUser) {
        session.user = tokenUser;
      }

      // console.log("session user", session.user);
      return session;
    },
    async jwt({ token }) {
      if (token && token.sub) {
        const studentDB = await db.query.users.findFirst({
          where: eq(users.id, token.sub),
        });
        token.user = studentDB;
      }
      // console.log("jwt token sub", token.sub);
      return token;
    },
  },
});
