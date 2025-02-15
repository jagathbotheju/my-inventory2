import SellTransactions from "@/components/transactions/SellTransactions";
import { auth } from "@/lib/auth";
import { User } from "@/server/db/schema/users";

const SellTransactionsPage = async () => {
  const session = await auth();
  const user = session?.user as User;

  return (
    <div className="flex flex-col gap-10 w-full">
      <SellTransactions user={user} />
    </div>
  );
};
export default SellTransactionsPage;
