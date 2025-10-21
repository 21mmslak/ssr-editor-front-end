import React, { useEffect, useRef, useState } from "react";
import { deleteDocument } from "../api/api";
import {
  BsThreeDotsVertical,
  BsFiletypeJs,
  BsFiletypeTxt,
} from "react-icons/bs";
import SharePopup from "./SharePopup";
import { useNavigate } from "react-router-dom";

export default function DocumentCard({ doc, layout, onDeleted }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const menuRef = useRef(null);
  const FileIcon = doc.type === "code" ? BsFiletypeJs : BsFiletypeTxt;

  const handleNavigate = () => {
    if (!open && !showSharePopup) navigate(`/doc/${doc._id}`);
  };

  useEffect(() => {
    function onClickOutside(e) {
      if (open && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const Menu = () => (
    <div
      className={`
        absolute right-0 mt-2 w-48
        bg-white border border-gray-200 rounded-md shadow-lg
        z-10
      `}
      role="menu"
    >
      <button
        type="button"
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
          setShowSharePopup(true);
        }}
      >
        Dela
      </button>
      <button
        type="button"
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
          try {
            await deleteDocument(doc._id);
            onDeleted?.();
          } catch (err) {
            console.error("Failed to delete:", err);
          }
        }}
      >
        Radera
      </button>
    </div>
  );

  const MenuButton = () => (
    <button
      type="button"
      className="text-[1.2rem] text-gray-800 hover:text-gray-400 bg-transparent border-0 cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen((v) => !v);
      }}
    >
      <BsThreeDotsVertical />
    </button>
  );

  const GridLayout = () => (
    <div
      ref={menuRef}
      onClick={handleNavigate}
      className="
        relative
        w-[250px] h-[140px]
        p-4
        rounded-xl
        bg-gray-100
        border border-gray-200
        shadow-md
        hover:shadow-lg
        transition-shadow
        flex flex-col justify-between
      "
    >
      <div className="flex items-center gap-3">
        <FileIcon />
        <h3 className="font-semibold text-gray-800 truncate">{doc.title}</h3>
      </div>

      <div className="flex justify-between items-center mt-2">
        <small className="text-sm text-gray-500">
          {new Date(doc.updatedAt).toLocaleDateString()}
        </small>
        <div className="absolute top-2 right-2">
          <MenuButton />
        </div>
      </div>

      {open && <Menu />}

      <SharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        id={doc._id}
      />
    </div>
  );

  const ListLayout = () => (
    <div
      ref={menuRef}
      onClick={handleNavigate}
      className="
      grid grid-cols-[120px_1fr_200px_100px]
      items-center px-5 py-2
      hover:bg-gray-50 transition
      relative
    "
    >
      <div className="flex items-center gap-2">
        <FileIcon />
        <span className="text-gray-700">{doc.type}</span>
      </div>

      <h3 className="truncate text-gray-800 font-medium">{doc.title}</h3>

      <small className="text-gray-500 text-sm">
        {new Date(doc.updatedAt).toLocaleString("sv-SE")}
      </small>

      <div className="flex justify-end relative">
        <MenuButton />
        {open && <Menu />}
      </div>

      <SharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        id={doc._id}
      />
    </div>
  );

  return (layout === "grid" && <GridLayout />) || <ListLayout />;
}
