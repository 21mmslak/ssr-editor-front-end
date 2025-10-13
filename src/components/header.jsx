import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FiLogIn } from "react-icons/fi";
import { BiLogOut } from "react-icons/bi";

export default function Header() {
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    const updateToken = () => setToken(localStorage.getItem("token"));

    updateToken();
    window.addEventListener("tokenChanged", updateToken);
    window.addEventListener("storage", updateToken);

    return () => {
      window.removeEventListener("tokenChanged", updateToken);
      window.removeEventListener("storage", updateToken);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return (
    <header className="h-[70px] bg-white text-gray-600 flex items-center justify-between fixed top-0 left-0 w-full border-b-2 border-blue-700 z-40 px-4">
      <div className="flex items-center">
        <Link to="/">
          <img
            src="docImg.png"
            className="w-12 h-12 object-contain"
            alt="Logo"
          />
        </Link>
      </div>

      <div className="flex-grow flex justify-center">
        <div className="relative w-1/2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Sök, en dag kanske det funkar..."
            className="pl-10 pr-3 h-12 bg-gray-100 rounded-xl w-full"
          />
        </div>
      </div>

      <div className="text-2xl">
        {token ? (
          <button
            type="button"
            onClick={handleLogout}
            className="hover:text-gray-800 transition"
            aria-label="Logout"
            title="Logout"
          >
            <BiLogOut />
          </button>
        ) : (
          <Link
            to="/login"
            className="hover:text-gray-800 transition"
            aria-label="Logga in"
            title="Logga in"
          >
            <FiLogIn />
          </Link>
        )}
      </div>

      <div className="w-2" />
    </header>
  );
}