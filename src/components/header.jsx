import { Link } from "react-router-dom";
import { FaSearch } from 'react-icons/fa';

export default function Header() {
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
            className="pl-10 pr-3 h-12 bg-gray-100  rounded-xl w-full"
          />
        </div>
      </div>

      <div className="w-12" /> 
    </header>
  );
}