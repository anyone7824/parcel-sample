import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userName, setUserName] = useState(localStorage.getItem("userName"));

  const setAuthData = (name) => {
    if (name) {
      localStorage.setItem("userName", name);
      setUserName(name);
      console.log(name);
    } else {
      localStorage.removeItem("userName");
      setUserName(null);
    }
  };

  return (
    <>
      <UserContext.Provider value={{ setAuthData, userName }}>
        {children}
      </UserContext.Provider>
    </>
  );
};

export const useAuth = () => useContext(UserContext);
