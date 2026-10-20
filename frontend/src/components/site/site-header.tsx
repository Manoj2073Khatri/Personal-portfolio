"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/lib/cms/types";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return !href.startsWith("#") && pathname.startsWith(href.split("#")[0]);
}

export function SiteHeader({ name, navigation }: { name: string; navigation: NavLink[] }) {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="z-50 w-full py-7">
      <nav className="relative mx-auto flex w-full max-w-7xl basis-full flex-wrap items-center px-4 md:px-6 lg:grid lg:grid-cols-12 lg:px-8">
        <div className="flex items-center lg:col-span-3">
          <Link
            href="/"
            className="rounded-md text-lg font-semibold tracking-tight text-black focus:outline-hidden focus-visible:ring-2 focus-visible:ring-highlight dark:text-white"
          >
            {name || "Portfolio"}
          </Link>
        </div>

        <div className="ms-auto flex items-center gap-x-1 py-1 lg:order-3 lg:col-span-3 lg:gap-x-2 lg:ps-6">
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="relative flex size-9.5 items-center justify-center rounded-xl border border-gray-200 bg-white text-black hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-white/10"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </button>

          {navigation.length > 0 && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-nav"
              aria-label="Toggle navigation"
              className="flex size-9.5 items-center justify-center rounded-xl border border-gray-200 text-black hover:bg-gray-100 focus:outline-hidden lg:hidden dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          )}
        </div>

        {navigation.length > 0 && (
          <div
            id="site-nav"
            className={cn(
              "basis-full grow overflow-hidden lg:order-2 lg:col-span-6 lg:block lg:w-auto lg:basis-auto",
              open ? "block" : "hidden",
            )}
          >
            <ul className="mt-5 flex flex-col gap-x-0 gap-y-4 lg:mt-0 lg:flex-row lg:items-center lg:justify-center lg:gap-x-7 lg:gap-y-0">
              {navigation.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={`${item.label}-${item.href}`}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative inline-block text-black focus:outline-hidden focus-visible:underline dark:text-white",
                        active
                          ? "before:absolute before:start-0 before:bottom-0.5 before:-z-1 before:h-1 before:w-full before:bg-highlight"
                          : "hover:text-gray-600 dark:hover:text-neutral-300",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
