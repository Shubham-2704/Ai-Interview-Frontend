import React, { useRef, useState } from "react";

import { Trash, Upload, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ProfilePhotoSelector = ({ image, setImage }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Update the image state
      setImage(file);

      // Generate preview URL from the file
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  return (
    <div className="flex justify-center">
      <Input
        ref={inputRef}
        accept="image/*"
        type="file"
        onChange={handleImageChange}
        className="hidden"
      />

      {!image ? (
        <div className="w-20 h-20 bg-primary-foreground rounded-full flex items-center justify-center cursor-pointer relative">
          <User className="size-9 text-primary" />
          <Button
            onClick={onChooseFile}
            className="w-8 h-8 rounded-full absolute -bottom-1 -right-1"
          >
            <Upload />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <img
            src={previewUrl}
            alt="profile photo"
            className="w-20 h-20 rounded-full object-cover"
          />
          <Button
            onClick={handleRemoveImage}
            className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full absolute -bottom-1 -right-1"
          >
            <Trash />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoSelector;
