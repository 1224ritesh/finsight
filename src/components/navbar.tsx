"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, LogOut, Shield } from "lucide-react";
import dynamic from "next/dynamic";

function NavbarContent() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/tax-calculator", label: "Tax Calculator" },
    { href: "/expenses", label: "Expenses" },
    { href: "/ai-advisor", label: "AI Advisor" },
    { href: "/news", label: "News" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              FinSight India
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {session &&
                navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                {"role" in session.user && session.user.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <UserIcon className="h-4 w-4 mr-2" />
                      {session.user.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Use dynamic import with ssr: false to prevent hydration mismatch
export const Navbar = dynamic(() => Promise.resolve(NavbarContent), {
  ssr: false,
});
