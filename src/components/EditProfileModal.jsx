import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { UserContext } from "@/context/UserContext";
import { toast as hotToast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import ProfilePhotoSelector from "./Inputs/ProfilePhotoSelector";
import uploadImage from "@/utils/uploadImage";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";

// FIX: Change z.email to z.string().email
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"), // Fixed this line
  profileImage: z.any().optional(),
});

const EditProfileModal = ({ open, setOpen }) => {
  const { user, updateUser } = useContext(UserContext);

  const [profilePic, setProfilePic] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      profileImage: null,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Add reset function
  } = form;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let profileImageUrl = user?.profileImageUrl || "";
      
      // Check if profilePic is different from current image AND is a File object
      const isNewImage = profilePic && 
                        profilePic !== user?.profileImageUrl && 
                        profilePic instanceof File;
      
      if (isNewImage) {
        try {
          const uploadRes = await uploadImage(profilePic);
          profileImageUrl = uploadRes.imageUrl;
        } catch (uploadError) {
          hotToast.error("Failed to upload new profile image. Keeping existing one.", { position: "bottom-right" });
        }
      }

      const updateData = {
        name: data.name,
        email: data.email,
      };
      
      // Only include profileImageUrl if it changed
      if (profileImageUrl !== user?.profileImageUrl) {
        updateData.profileImageUrl = profileImageUrl;
      }

      const response = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE,
        updateData
      );

      updateUser({
        ...response.data,
        token: localStorage.getItem("token"),
      });
      hotToast.success("Profile updated successfully!", { position: "top-center" });
      setOpen(false);
    } catch (error) {
      
      // FIX: Don't close the modal on error
      // setOpen(false); // REMOVE THIS - keep modal open on error
      
      // Show error message from backend
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          "Failed to update profile.";
      hotToast.error(errorMessage, { position: "bottom-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      // FIX: Reset form with current user data every time modal opens
      reset({
        name: user.name || "",
        email: user.email || "",
        profileImage: null,
      });
      setProfilePic(user.profileImageUrl || null);
    }
  }, [open, user, reset]); // Add reset to dependency array

  const handleClose = () => {
    // FIX: Reset form when closing modal
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        profileImage: null,
      });
    }
    setProfilePic(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your name, email, or profile photo.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 space-y-2 py-4"
        >
          <ProfilePhotoSelector
            setImage={setProfilePic}
            name="profileImage"
            image={profilePic}
          />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input 
              id="name" 
              {...register("name")} 
              className="col-span-3" 
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="col-span-4 text-center text-red-500 text-sm">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input 
              id="email" 
              {...register("email")} 
              className="col-span-3" 
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="col-span-4 text-center text-red-500 text-sm">
                {errors.email.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;