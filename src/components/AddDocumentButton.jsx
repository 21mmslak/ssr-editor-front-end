import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { BsFileEarmarkPlus } from "react-icons/bs";

export default function AddDocumentButton() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex items-center justify-center gap-1
          px-3 py-1
          border border-gray-200
          rounded-md
          text-gray-800
          hover:text-gray-50 hover:bg-gray-800
          transition-colors
        "
      >
        <BsFileEarmarkPlus className="text-2xl" />
      </button>

      {open && (
        <div
          className="
            absolute right-0 mt-2 w-48
            bg-white border border-gray-200 rounded-md shadow-lg
            z-10
          "
          role="menu"
        >
          <Link
            to="/addDocument/text"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Textdokument
          </Link>
          <Link
            to="/addDocument/code"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Kod-dokument
          </Link>
        </div>
      )}
    </div>
  );
}
