import Stocks from "@/components/stocks/Stocks";
import { auth } from "@/lib/auth";
import { User } from "@/server/db/schema/users";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const StocksPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user as User;
  if (!session) redirect("/auth/login");

  return (
    <div className="flex flex-col gap-10 w-full">
      <Stocks user={user} />
    </div>
  );
};

export default StocksPage;
