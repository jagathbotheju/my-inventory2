import StockDetails from "@/components/stocks/StockDetails";
import { auth } from "@/lib/auth";
import { User } from "@/server/db/schema/users";
import { redirect } from "next/navigation";

const StockDetailsPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ stockBal: string }>;
}) => {
  const session = await auth();
  const user = session?.user as User;
  if (!session) redirect("/auth/login");
  const productId = (await params).id;
  const stockBal = (await searchParams).stockBal;

  return (
    <div className="flex flex-col gap-10 w-full">
      <StockDetails user={user} productId={productId} stockBal={stockBal} />
    </div>
  );
};

export default StockDetailsPage;
