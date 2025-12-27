import React from "react";
import { Link } from "react-router-dom";

import {
  NavigationMenu,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import ProfileInfoCard from "../Cards/ProfileInfoCard";

const Navbar = () => {
  return (
    <NavigationMenu className="h-16 max-w-full justify-normal border border-b border-gray-200/50 backdrop-blur-sm py-2.5 px-4 md:px-0 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between gap-5">
        <NavigationMenuItem
          className="text-lg md:text-xl font-medium leading-5"
          asChild
        >
          <Link to="/dashboard">Interview Prep AI</Link>
        </NavigationMenuItem>
        <NavigationMenuItem asChild>
          <ProfileInfoCard />
        </NavigationMenuItem>
      </div>
    </NavigationMenu>
  );
};

export default Navbar;
