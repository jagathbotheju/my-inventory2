import TransactionsSummary from "@/components/transactions/TransactionsSummary";
import { auth } from "@/lib/auth";
import { User } from "@/server/db/schema/users";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  const user = session?.user as User;
  console.log("user", user);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col gap-10 w-full">
      <TransactionsSummary user={user} />
    </div>
  );
}
