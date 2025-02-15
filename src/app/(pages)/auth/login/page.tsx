import LoginForm from "@/components/auth/LoginForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// interface Props {
//   searchParams: {
//     callbackUrl?: string;
//   };

// }

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) => {
  const session = await auth();
  const user = session?.user;
  const { callbackUrl } = await searchParams;

  if (user) redirect("/");

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
};
export default LoginPage;
