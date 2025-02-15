import BuyTransactions from "@/components/transactions/BuyTransactions";
import { auth } from "@/lib/auth";
import { User } from "@/server/db/schema/users";
import { redirect } from "next/navigation";

const BuyTransactionsPage = async () => {
  const session = await auth();
  const user = session?.user as User;
  if (!user) redirect("/auth/login");

  return (
    <div className="flex flex-col gap-10 w-full">
      <BuyTransactions user={user} />
    </div>
  );
};
export default BuyTransactionsPage;
