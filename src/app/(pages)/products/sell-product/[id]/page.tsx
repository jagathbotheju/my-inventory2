import SellProduct from "@/components/products/SellProduct";
import { auth } from "@/lib/auth";
import { User } from "@/server/db/schema/users";
import { redirect } from "next/navigation";

interface Props {
  params: {
    id: string;
  };
}

const SellProductPage = async ({ params }: Props) => {
  const productId = (await params).id;
  const session = await auth();
  const user = session?.user as User;
  // console.log("session", session);
  if (!session) {
    redirect(`/auth/login?callbackUrl=/products/buy-products/${productId}`);
  }

  return (
    <div className="flex flex-col gap-10 w-full">
      <SellProduct productId={productId} userId={user.id} />
    </div>
  );
};
export default SellProductPage;
