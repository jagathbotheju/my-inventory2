import BuyProduct from "@/components/products/BuyProduct";
import { auth } from "@/lib/auth";
import { User } from "@/server/db/schema/users";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// interface Props {
//   params: {
//     id: string;
//   };
// }

const BuyProductPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const productId = (await params).id;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user as User;
  if (!session) {
    redirect(`/auth/login?callbackUrl=/products/buy-products/${productId}`);
  }

  return (
    <div className="flex flex-col gap-10 w-full">
      <BuyProduct productId={productId} userId={user.id} />
    </div>
  );
};
export default BuyProductPage;
