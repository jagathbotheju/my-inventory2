import AllProducts from "@/components/products/AllProducts";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const ProductsPage = async () => {
  const session = await auth();
  if (!session) redirect("/auth/login");

  return (
    <div className="flex flex-col gap-10 w-full">
      <AllProducts />
    </div>
  );
};
export default ProductsPage;
