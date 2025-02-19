import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User } from "@/server/db/schema/users";
import ProductDetails from "@/components/products/ProductDetails";

const ProductDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const productId = (await params).id;
  const session = await auth();
  const user = session?.user as User;

  if (!session) {
    redirect(`/auth/login`);
  }

  return (
    <div className="flex flex-col gap-10 w-full">
      <ProductDetails userId={user?.id} productId={productId} />
    </div>
  );
};
export default ProductDetailsPage;
