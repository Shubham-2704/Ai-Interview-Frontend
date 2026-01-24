import React, { useContext, useState } from "react";
import { UserContext } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
  ItemMedia,
} from "@/components/ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

import EditProfileModal from "../EditProfileModal";

const ProfileInfoCard = () => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    clearUser();
    navigate("/");
  };

  if (!user) return null;

  return (
    <>
      {/* Desktop View (md and above) */}
      <div className="hidden md:flex">
        <Item className="p-0 gap-2">
          {/* CLICK → OPEN EDIT PROFILE MODAL */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <ItemMedia variant="image" className="size-11">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="size-11 bg-gray-300">
                    <AvatarImage src={user.profileImageUrl} alt={user.name} />
                    <AvatarFallback>
                      {user.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>Click to edit profile</TooltipContent>
              </Tooltip>
            </ItemMedia>

            <ItemContent>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ItemTitle className="font-bold">{user.name}</ItemTitle>
                </TooltipTrigger>
                <TooltipContent>Click to edit profile</TooltipContent>
              </Tooltip>
              <ItemActions>
                <Button
                  variant="link"
                  onClick={handleLogout}
                  className="p-0 h-4 font-semibold"
                >
                  Logout
                </Button>
              </ItemActions>
            </ItemContent>
          </div>
        </Item>
      </div>

      {/* Mobile View (below md) */}
      <div className="flex md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full p-0"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.profileImageUrl} alt={user.name} />
                <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImageUrl} alt={user.name} />
                <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Edit Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit Profile Modal (Shared for both views) */}
      <EditProfileModal open={open} setOpen={setOpen} />
    </>
  );
};

export default ProfileInfoCard;