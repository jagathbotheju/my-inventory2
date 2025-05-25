"use client";
import { Button } from "../ui/button";
import Link from "next/link";
import {
  BaggageClaimIcon,
  BlocksIcon,
  LogIn,
  LogOutIcon,
  ReceiptTextIcon,
  RulerIcon,
  // UserPen,
  UserRoundPen,
  Users2Icon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { User } from "@/server/db/schema/users";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { LucideFactory } from "lucide-react";

interface Props {
  user: User;
}

const AuthButton = ({ user }: Props) => {
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  // console.log("user", user);

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <div className="flex gap-4 items-center">
          <div className="flex gap-6 items-center">
            <Button
              onClick={() => router.push("/products")}
              className="font-semibold"
            >
              Products
            </Button>
            <div className="flex flex-col">
              <h3 className="font-semibold text-xl">{user.name}</h3>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="focus-visible:outline-none">
              <Avatar>
                <AvatarImage src={user.image ?? ""} alt="user" />
                <AvatarFallback>
                  <span className="text-amber-400 font-semibold">
                    {user.name?.slice(0, 2).toUpperCase()}
                  </span>
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60 p-2" align="end">
              {/* suppliers */}
              <DropdownMenuItem
                className="font-medium transition-all duration-500 cursor-pointer group ease-in-out"
                onClick={() => router.push("/suppliers")}
              >
                <LucideFactory className="mr-2 w-4 group-hover:translate-x-1 transition-all duration-300 ease-in-out group-hover:text-primary group-hover:font-semibold" />
                <span className="hover:text-primary">Suppliers</span>
              </DropdownMenuItem>

              {/* customers */}
              <DropdownMenuItem
                className="font-medium transition-all duration-500 cursor-pointer group ease-in-out"
                onClick={() => router.push("/customers")}
              >
                <Users2Icon className="mr-2 w-4 group-hover:translate-x-1 transition-all duration-300 ease-in-out group-hover:text-primary group-hover:font-semibold" />
                <span className="hover:text-primary">Customers</span>
              </DropdownMenuItem>

              {/* products */}
              <DropdownMenuItem
                className="font-medium transition-all duration-500 cursor-pointer group ease-in-out"
                onClick={() => router.push("/products")}
              >
                <BaggageClaimIcon className="mr-2 w-4 group-hover:translate-x-1 transition-all duration-300 ease-in-out group-hover:text-primary group-hover:font-semibold" />
                <span className="hover:text-primary">Products</span>
              </DropdownMenuItem>

              {/* invoice */}
              <DropdownMenuItem
                className="font-medium transition-all duration-500 cursor-pointer group ease-in-out group-hover:text-primary group-hover:font-semibold"
                onClick={() => router.push("/invoice")}
              >
                <ReceiptTextIcon className="mr-2 w-4 group-hover:translate-x-1 transition-all duration-300 ease-in-out" />
                <span className="hover:text-primary">Invoice</span>
              </DropdownMenuItem>

              {/* stocks */}
              <DropdownMenuItem
                className="font-medium transition-all duration-500 cursor-pointer group ease-in-out"
                onClick={() => router.push("/stocks")}
              >
                <BlocksIcon className="mr-2 w-4 group-hover:translate-x-1 transition-all duration-300 ease-in-out group-hover:text-primary group-hover:font-semibold" />
                <span className="hover:text-primary">Stocks</span>
              </DropdownMenuItem>

              {/* uom */}
              <DropdownMenuItem
                className="font-medium transition-all duration-500 cursor-pointer group ease-in-out"
                onClick={() => router.push("/uoms")}
              >
                <RulerIcon className="mr-2 w-4 group-hover:translate-x-1 transition-all duration-300 ease-in-out group-hover:text-primary group-hover:font-semibold" />
                <span className="hover:text-primary">UMOs</span>
              </DropdownMenuItem>

              {/* profiles */}
              <DropdownMenuItem
                onClick={() => router.push("/user/profile")}
                className="font-medium transition-all duration-500 cursor-pointer group ease-in-out"
              >
                <UserRoundPen className="mr-2 w-4 group-hover:translate-x-1 transition-all duration-300 ease-in-out group-hover:text-primary group-hover:font-semibold" />
                <span className="hover:text-primary">Profile</span>
              </DropdownMenuItem>

              {/* theme switch */}
              <DropdownMenuItem
                className="font-medium transition-all duration-500 cursor-pointer group ease-in-out"
                onClick={(e) => {
                  e.stopPropagation();
                  setTheme(theme === "dark" ? "light" : "dark");
                }}
              >
                <ThemeSwitcher />
              </DropdownMenuItem>

              {/* admin */}
              {user && user.role === "admin" && (
                <DropdownMenuItem
                  className="font-medium transition-all duration-500 cursor-pointer group ease-in-out"
                  onClick={() => router.push("/admin")}
                >
                  <LogOutIcon className="mr-2 w-4 group-hover:rotate-180 transition-all duration-300 ease-in-out" />
                  <span className="hover:text-primary">Admin</span>
                </DropdownMenuItem>
              )}

              {/* logout */}
              <DropdownMenuItem
                className="font-medium transition-all duration-500 cursor-pointer group ease-in-out"
                onClick={() => signOut()}
              >
                <LogOutIcon className="mr-2 w-4 group-hover:rotate-180 transition-all duration-300 ease-in-out group-hover:text-primary group-hover:font-semibold" />
                <span className="hover:text-primary">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <>
          <Button asChild size="sm">
            <Link href="/auth/login" className="flex items-center gap-1">
              <LogIn size={16} />
              <span>Login</span>
            </Link>
          </Button>
          {/* <Button asChild size="sm">
            <Link href="/auth/register" className="flex items-center gap-1">
              <UserPen size={16} />
              <span>Register</span>
            </Link>
          </Button> */}
        </>
      )}
    </div>
  );
};
export default AuthButton;
