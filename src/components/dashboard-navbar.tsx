"use client";

import Link from "next/link";
import { createClient } from "../../supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { UserCircle, Home, Plane, Search, Star, Settings } from "lucide-react";
import Image from "next/image";

export default function DashboardNavbar() {
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            prefetch
            className="text-xl font-bold flex items-center text-blue-600"
          >
            <Image
              src="/pilot-logo.svg"
              alt="PilotRatings Logo"
              width={32}
              height={32}
              className="mr-2"
            />
            PilotRatings
          </Link>
        </div>

        <div className="hidden md:flex space-x-6">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-blue-600 font-medium flex items-center"
          >
            <Home className="h-4 w-4 mr-1" />
            Dashboard
          </Link>
          <Link
            href="#"
            className="text-gray-600 hover:text-blue-600 font-medium flex items-center"
          >
            <Search className="h-4 w-4 mr-1" />
            Find Pilots
          </Link>
          <Link
            href="#"
            className="text-gray-600 hover:text-blue-600 font-medium flex items-center"
          >
            <Star className="h-4 w-4 mr-1" />
            My Ratings
          </Link>
          <Link
            href="#"
            className="text-gray-600 hover:text-blue-600 font-medium flex items-center"
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Link>
        </div>

        <div className="flex gap-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href="#" className="w-full">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#" className="w-full">
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="#" className="w-full">
                  Subscription
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
