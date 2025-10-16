import Reports from "@/components/reports/Reports";
import { auth } from "@/lib/auth";
import { User } from "@/server/db/schema/users";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const ReportsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/auth/login");
  const user = session?.user as User;

  return (
    <div className="flex flex-col gap-10 w-full">
      <Reports user={user} />
    </div>
  );
};

export default ReportsPage;
