import React from "react";
import { Link } from "react-router-dom";

import {
  NavigationMenu,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import ProfileInfoCard from "../Cards/ProfileInfoCard";
import ApiKeyModal from "../ApiKeyModal";
import SetupGuideModal from "../SetupGuideModal"; // New component

const Navbar = () => {
  return (
    <NavigationMenu className="h-16 max-w-full justify-normal border border-b border-gray-200/50 backdrop-blur-sm py-2.5 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between gap-5">
        <NavigationMenuItem
          className="text-lg md:text-2xl font-medium leading-5"
          asChild
        >
          <Link to="/dashboard">Intervia</Link>
        </NavigationMenuItem>
        <div className="flex items-center gap-1">
          {/* Question mark button for Setup Guide */}
          <div className="flex mr-2">
          <NavigationMenuItem>
            <SetupGuideModal />
          </NavigationMenuItem>
          
          {/* Original Add/Edit API Key button */}
          <NavigationMenuItem asChild>
            <ApiKeyModal />
          </NavigationMenuItem>
          </div>
          
          <NavigationMenuItem asChild>
            <ProfileInfoCard />
          </NavigationMenuItem>
        </div>
      </div>
    </NavigationMenu>
  );
};

export default Navbar;