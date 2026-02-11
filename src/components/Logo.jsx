import React from "react";
import { Mic2, Sparkles } from "lucide-react";

const Logo = ({ className = "", size = "default" }) => {
  const sizes = {
    small: {
      container: "text-xl",
      icon: "size-5",
      spacing: "gap-2",
    },
    default: {
      container: "text-3xl",
      icon: "size-7",
      spacing: "gap-2.5",
    },
    large: {
      container: "text-4xl",
      icon: "size-9",
      spacing: "gap-3",
    },
  };

  const currentSize = sizes[size] || sizes.default;

  return (
    <div className={`flex items-center ${currentSize.spacing} ${className}`}>
      <div className="relative">
        <div className="absolute -inset-1 bg-linear-to-r from-amber-400 to-orange-500 rounded-lg blur opacity-30"></div>
        <div className="relative bg-linear-to-br from-amber-400 to-orange-500 p-2 rounded-lg">
          <Mic2
            className={`${currentSize.icon} text-white`}
            strokeWidth={2.5}
          />
        </div>
      </div>
      <span
        className={`font-bold ${currentSize.container} text-black-900 tracking-tight`}
      >
        Inter
        <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-500 to-orange-500">
          via
        </span>
      </span>
    </div>
  );
};

export default Logo;
