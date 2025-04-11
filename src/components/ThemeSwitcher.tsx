"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "./ui/switch";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex w-full justify-between items-center">
      <div className="flex group items-center">
        {theme === "dark" && (
          <Sun className="group-hover:text-primary cursor-pointer text-foreground mr-1 w-5 group-hover:rotate-180 transition-all duration-300 ease-in-out" />
        )}
        {theme === "light" && (
          <Moon className="group-hover:text-primary cursor-pointer text-foreground mr-1 w-5 group-hover:rotate-180 transition-all duration-300 ease-in-out" />
        )}
        <span className="hover:text-primary ml-1">
          Theme {theme?.toLocaleUpperCase()}
        </span>
      </div>
      <Switch checked={theme === "dark"} />
    </div>
  );
}
