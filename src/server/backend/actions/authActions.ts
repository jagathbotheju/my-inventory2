"use server";
import { signIn } from "@/lib/auth";

export const socialSignIn = async ({
  social,
  callback,
}: {
  social: string;
  callback: string;
}) => {
  await signIn(social, { redirectTo: callback });
};
