import Link from "next/link";
import { User } from "@/server/db/schema/users";
import { auth } from "@/lib/auth";
import AuthButton from "./auth/AuthButton";

const Navbar = async () => {
  const session = await auth();
  const user = session?.user as User;

  return (
    <div className="border-b-[1.5px] border-b-primary sticky top-0 z-50 dark:bg-slate-900 bg-slate-50">
      <nav className="max-w-7xl mx-auto px-10 pt-6 pb-4">
        <ul className="flex justify-between items-center">
          <li>
            <Link href="/" className="relative flex gap-2 items-center">
              <h1 className="text-center text-rose-500 text-5xl font-bold tracking-wide">
                My
                <span className="dark:text-white text-black">Inventory</span>
              </h1>
            </Link>
          </li>
          <li>
            <AuthButton user={user} />
          </li>
        </ul>
      </nav>
    </div>
  );
};
export default Navbar;
