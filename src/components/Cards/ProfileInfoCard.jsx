import React, { useContext } from "react";
import { UserContext } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const ProfileInfoCard = () => {
  const { user, clearUser } = useContext(UserContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/");
  };

  return (
    user && (
      <Item className="p-0 gap-2">
        <ItemMedia variant="image" className="size-11">
          <Avatar className="size-11 bg-gray-300">
            <AvatarImage src={user.profileImageUrl} alt={user.name} />
            <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <div className="flex flex-col">
          <ItemContent>
            <ItemTitle className="font-bold">{user.name || ""}</ItemTitle>
          </ItemContent>
          <ItemActions>
            <Button
              variant={"link"}
              onClick={handleLogout}
              className="p-0 h-4 font-semibold"
            >
              Logout
            </Button>
          </ItemActions>
        </div>
      </Item>
    )
  );
};

export default ProfileInfoCard;
