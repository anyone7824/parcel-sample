import { Link } from "react-router-dom";
const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-500 flex flex-col gap-6 items-center justify-center">
      <p className="font-mono font-bold text-white text-7xl">
        Page Not Found - 404
      </p>
      <Link
        to={"/"}
        className="h-12 w-40 bg-blue-500 rounded-lg hover:bg-blue-400 text-white font-bold font-mono"
      >
        <button className="h-full hover:text-blue-500 w-full text-center cursor-pointer">
          Return to Home Page
        </button>
      </Link>
    </div>
  );
};

export default NotFound;
