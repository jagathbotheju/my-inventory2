import Link from "next/link";
import AuthButton from "./auth/AuthButton";

const Navbar = async () => {
  return (
    <div className="border-b-[1.5px] border-b-primary sticky top-0 z-50 dark:bg-slate-900 bg-slate-50">
      <nav className="max-w-7xl mx-auto px-10 pt-6 pb-4">
        <ul className="flex justify-between items-center">
          <li>
            <Link href="/" className="relative flex gap-2 items-center">
              <h1 className="text-center text-rose-500 text-5xl font-bold tracking-wide">
                New
                <span className="dark:text-white text-black">Inventory</span>
              </h1>
            </Link>
          </li>
          <li>
            <AuthButton />
          </li>
        </ul>
      </nav>
    </div>
  );
};
export default Navbar;
