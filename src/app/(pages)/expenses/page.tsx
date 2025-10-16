import Expenses from "@/components/expenses/Expenses";
import { auth } from "@/lib/auth";
import { User } from "@/server/db/schema/users";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const ExpensesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user as User;
  if (!session) redirect("/auth/login");

  return (
    <div className="flex w-full">
      <Expenses user={user} />
    </div>
  );
};

export default ExpensesPage;
