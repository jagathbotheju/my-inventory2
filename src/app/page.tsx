import TransactionsSummary from "@/components/transactions/TransactionsSummary";
import { auth } from "@/lib/auth";
import { User } from "@/server/db/schema/users";
import { redirect } from "next/navigation";
import { signOut } from "next-auth/react";

export default async function Home() {
  const session = await auth();
  const user = session?.user as User;

  if (!session || !user || !user.id) {
    signOut();
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col gap-10 w-full">
      <TransactionsSummary user={user} />
    </div>
  );
}
