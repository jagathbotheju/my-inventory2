import Uoms from "@/components/uom/Uoms";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const UomPage = async () => {
  const session = await auth();
  if (!session) redirect("/auth/login");

  return (
    <div className="flex flex-col gap-10 w-full">
      <Uoms />
    </div>
  );
};
export default UomPage;
