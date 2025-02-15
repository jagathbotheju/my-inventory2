import AddProduct from "@/components/products/AddProduct";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const AddProductPage = async () => {
  const session = await auth();
  if (!session) redirect("/auth/login");

  return (
    <div className="flex flex-col gap-10 w-full">
      <AddProduct />
    </div>
  );
};
export default AddProductPage;
