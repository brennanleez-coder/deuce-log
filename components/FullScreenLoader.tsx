import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

interface LoaderProps {
  fullScreen?: boolean;
  size?: number;
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({
  fullScreen = false,
  size = 80,
  color = "blue",
}) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-white z-50"
    : "flex items-center justify-center w-full h-full";

  return (
    <div className={containerClasses}>
      <ClipLoader size={size} color={color} />
    </div>
  );
};

export default Loader;
