import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Popup = (success, message) => {
  const [showPopup, setShowPopup] = useState(true);
  const navigate = useNavigate();
  const handlePopup = () => {
    setShowPopup(false);
    navigate("/login");
  };
  return (
    <>
      {showPopup && (
        <div className="h-40 w-40 flex flex-col items-center justify-center border rounded-lg bg-white relative left-1/2 top-1/2 z-30">
          <p
            className={
              success
                ? "font-mono text-lg text-green-400"
                : "font-mono text-lg text-black"
            }
          >
            {message}
          </p>
          <button
            onClick={() => handlePopup}
            className="h-10 w-15 bg-blue-500 text-white font-mono font-bold hover:bg-blue-200 cursor-pointer"
          >
            Go to Login Page
          </button>
        </div>
      )}
    </>
  );
};

export default Popup;
