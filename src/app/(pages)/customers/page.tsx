import Customers from "@/components/customers/Customers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const SuppliersPage = async () => {
  const session = await auth();
  if (!session) redirect("/auth/login");

  return (
    <div className="flex flex-col gap-10 w-full">
      <Customers />
    </div>
  );
};
export default SuppliersPage;
