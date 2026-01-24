import React from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import ProfileInfoCard from "../Cards/ProfileInfoCard";
import ApiKeyModal from "../ApiKeyModal";
import SetupGuideModal from "../SetupGuideModal";

const Navbar = () => {
  return (
    <NavigationMenu className="h-16 max-w-full justify-normal border-b border-gray-200/50 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 mx-auto flex items-center justify-between h-full">
        {/* Logo/Brand */}
        <NavigationMenuItem className="shrink-0" asChild>
          <Link
            to="/dashboard"
            className="text-xl sm:text-xl md:text-2xl font-semibold tracking-tight text-gray-900 hover:text-gray-700 transition-colors"
          >
            Intervia
          </Link>
        </NavigationMenuItem>

        {/* Right side buttons */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          <NavigationMenuItem>
            <SetupGuideModal />
          </NavigationMenuItem>

          {/* API Key Modal - Responsive sizing */}
          <NavigationMenuItem asChild>
            <ApiKeyModal />
          </NavigationMenuItem>

          {/* Profile - Always visible */}
          <NavigationMenuItem asChild>
            <ProfileInfoCard />
          </NavigationMenuItem>
        </div>
      </div>
    </NavigationMenu>
  );
};

export default Navbar;
