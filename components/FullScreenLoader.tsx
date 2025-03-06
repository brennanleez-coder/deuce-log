import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

interface LoaderProps {
  fullScreen?: boolean;
  size?: number;
  color?: string;
  overlayColor?: string;
}

const Loader: React.FC<LoaderProps> = ({
  fullScreen = false,
  size = 80,
  color = "#3B82F6", // Tailwind's blue-500
  overlayColor = "rgba(255, 255, 255, 0.8)", // Soft white overlay
}) => {
  return (
    <div
      className={`flex items-center justify-center transition-opacity duration-300 ${
        fullScreen
          ? "fixed inset-0 z-50 bg-opacity-50 backdrop-blur-sm"
          : "w-full h-full"
      }`}
      style={fullScreen ? { backgroundColor: overlayColor } : {}}
    >
      <ClipLoader size={size} color={color} />
    </div>
  );
};

export default Loader;
