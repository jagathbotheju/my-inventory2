import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/server/db/schema";
import { db } from "@/server/db";

export const auth = betterAuth({
  appName: "inventory2",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, //7 days
    updateAge: 60 * 60 * 24, //1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, //5 min
    },
    disableSessionRefresh: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
