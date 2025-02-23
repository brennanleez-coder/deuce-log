import ClipLoader from "react-spinners/ClipLoader";

const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <ClipLoader size={80} color="blue" />
    </div>
  );
}

export default FullScreenLoader;