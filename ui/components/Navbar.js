import { NavLink } from "react-router-dom";

const Navbar = () => {
  const linkStyle = ({ isActive }) =>
    isActive
      ? "font-bold font-mono text-blue-600 text-lg"
      : "font-mono font-bold text-lg text-black hover:text-blue-600 hover:scale-105 transition-all duration-200";

  return (
    <div className="h-18 w-full flex items-center justify-center gap-10 shadow-lg">
      <NavLink to={"/"} end className={linkStyle}>
        Home
      </NavLink>
      <NavLink to={"/about"} className={linkStyle}>
        About
      </NavLink>
      <NavLink to={"/login"} className={linkStyle}>
        Login
      </NavLink>
      <NavLink to={"/signup"} className={linkStyle}>
        Signup
      </NavLink>
    </div>
  );
};

export default Navbar;
