import EditProduct from "@/components/products/EditProduct";
import { auth } from "@/lib/auth";
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
  const session = await auth();
  if (!session) redirect("/auth/login");

  return (
    <div className="flex flex-col gap-10 w-full">
      <EditProduct productId={id} />
    </div>
  );
};
export default EditProductPage;
