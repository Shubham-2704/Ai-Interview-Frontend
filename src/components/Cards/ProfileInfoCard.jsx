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

import EditProfileModal from "../EditProfileModal";

const ProfileInfoCard = () => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    // localStorage.clear();
    clearUser();
    navigate("/");
  };

  if (!user) return null;

  return (
    <>
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

      {/* Edit Profile Modal */}
      <EditProfileModal open={open} setOpen={setOpen} />
    </>
  );
};

export default ProfileInfoCard;
