import { useState } from "react";
import { axiosAPI } from "../api/axios";
import { useAuth } from "./contexts/UserContext.js";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [values, setValues] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { setAuthData } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(values);
      const res = await axiosAPI.post("/login", values);
      if (res.status === 200) {
        console.log(res.data.name);
        setAuthData(res.data.name);
        navigate("/", { replace: true });
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#9CD5FF]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 items-center bg-white justify-center h-80 w-90 sm:w-100 shadow-2xl rounded-lg p-4"
      >
        <h1 className="font-bold text-2xl font-mono">Login</h1>
        <input
          type="text"
          placeholder="Username or Email"
          name="identifier"
          onChange={(e) =>
            setValues({ ...values, [e.target.name]: e.target.value })
          }
          required
          className="border-b-2 w-70 sm:w-80 h-12 pl-2 font-mono text-black focus:outline-none focus:border-green-500"
        />
        <div className="relative w-full max-w-70 sm:max-w-80">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            name="password"
            onChange={(e) =>
              setValues({ ...values, [e.target.name]: e.target.value })
            }
            required
            className="border-b-2 w-70 sm:w-80 h-12 pl-2 font-mono text-black focus:outline-none focus:border-green-500"
          />
          <span
            className="material-icons absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-800"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "visibility_off" : "visibility"}
          </span>
        </div>
        <button
          type="submit"
          className=" w-40 h-10 rounded-lg cursor-pointer bg-[#9CD5FF] font-bold font-mono sm:text-md hover:bg-blue-200"
        >
          Login
        </button>
        <Link to={"/signup"} className="text-blue-400">
          Don't have an account?
        </Link>
      </form>
    </div>
  );
};

export default Login;
