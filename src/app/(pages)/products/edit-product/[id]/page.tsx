import EditProduct from "@/components/products/EditProduct";
import { auth } from "@/lib/auth";
import { User } from "@/server/db/schema/users";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// interface Props {
//   params: {
//     id: string;
//   };
// }

const EditProductPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user as User;
  if (!session) redirect("/auth/login");

  return (
    <div className="flex flex-col gap-10 w-full">
      <EditProduct productId={id} userId={user?.id} />
    </div>
  );
};
export default EditProductPage;
