import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BsThreeDotsVertical, BsGrid3X2Gap } from 'react-icons/bs';
import { FaList } from 'react-icons/fa';
import { HiOutlinePlusSm } from 'react-icons/hi';
import { getDocuments, deleteDocument } from "../api";

function DocumentCard({ doc, layout, onDeleted }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function onClickOutside(e) {
            if (open && menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [open]);

    if (layout === "grid") {
        return (
            <div
                ref={menuRef}
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
                    <img src="docImg.png" alt="Logo" className="h-[30px] w-[30px] rounded-md" />
                    <h3 className="font-semibold text-gray-800 truncate">{doc.title}</h3>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <small className="text-sm text-gray-500">
                    {new Date(doc.updatedAt).toLocaleDateString()}
                    </small>

                    <button
                    type="button"
                    className="
                        absolute top-2 right-2
                        text-[1.2rem] text-gray-800
                        hover:text-gray-400
                        bg-transparent border-0 cursor-pointer
                    "
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpen((v) => !v);
                    }}
                    >
                    <BsThreeDotsVertical />
                    </button>
                </div>
                {open && (
                    <div className="
                            absolute top-[1.9rem] right-[0.3rem]
                            bg-white text-[#222]
                            border border-gray-200
                            rounded-lg
                            shadow-[0_8px_24px_rgba(0,0,0,0.15)]
                            min-w-[140px]
                            z-10
                            overflow-hidden
                        " role="menu">
                        <button
                            type="button"
                            className="block w-full text-left px-3 py-2 hover:bg-gray-200"
                            role="menuitem"
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpen(false);
                                try {
                                    await deleteDocument(doc._id);
                                    onDeleted?.();
                                } catch (err) {
                                    console.error("Failed to delete: ", err);
                                }
                            }}
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        );
    } else {
        return (
            <div className="flex justify-between text-center items-center border-b-[0.9px] border-gray-200 h-[50px] pr-5" ref={menuRef}>
                <img src="docImg.png" alt="Logo" className="h-9 w-9 rounded-md ml-2" />
                <h3 className="truncate max-w-[200px] w-[200px]">
                    {doc.title}
                </h3>
                <small>Updated: {new Date(doc.updatedAt).toLocaleString()}</small>
                {/* <small>Created: {new Date(doc.createdAt).toLocaleString()}</small> */}
                <button
                    type="button"
                    className="right-2 bg-transparent border-0 cursor-pointer text-[1.1rem] text-gray-800 hover:text-gray-400"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpen((v) => !v);
                    }}
                >
                <BsThreeDotsVertical />
                </button>

                {open && (
                    <div className="
                            absolute right-[1.8rem] translate-y-[2rem]
                            bg-white text-[#222]
                            border border-gray-200
                            rounded-lg
                            shadow-[0_8px_24px_rgba(0,0,0,0.15)]
                            min-w-[140px]
                            z-10
                            overflow-hidden
                        " role="menu">
                        <button
                            type="button"
                            className="block w-full text-left px-3 py-2 hover:bg-gray-200"
                            role="menuitem"
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpen(false);
                                try {
                                    await deleteDocument(doc._id);
                                    console.log("Dokument raderat!");
                                    onDeleted?.();
                                } catch (err) {
                                    console.error("Misslyckades:", err);
                                }
                            }}
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        );
    }
    
}

function AllDocuments() {
    const [docs, setDocs] = useState([]);
    const [layout, setLayout] = useState(() => {
        if (typeof window === "undefined") return "list";
        return localStorage.getItem("layout") || "list";
    });

    useEffect(() => {
        localStorage.setItem("layout", layout);
    }, [layout]);


    useEffect(() => {
        getDocuments().then(setDocs);
    }, []);

    return (
        <section>
        <div
            className="
                flex justify-end
                bg-gray-100 border border-gray-100
                rounded-md
                p-2
                text-2xl
                "
                role="group"
                aria-label="Växla layout"
            >
            <Link
                type="button"
                to="/addDocument"
                className="
                flex items-center justify-center
                px-3 py-1
                border border-gray-200
                rounded-md
                text-gray-800
                hover:text-gray-50 hover:bg-gray-800
                transition-colors
                "
            >
                <HiOutlinePlusSm />
            </Link>
            <label
                className={`
                    flex items-center cursor-pointer px-3 py-1
                    border border-gray-200
                    transition-colors
                    rounded-l-md
                    ${layout === "list"
                        ? "bg-gray-800 text-white"
                        : "text-gray-800 hover:bg-gray-50"
                    }
                `}
                >
            <input
                type="radio"
                name="layout"
                value="list"
                checked={layout === "list"}
                onChange={() => setLayout("list")}
                className="sr-only"
            />
            <FaList />
            </label>
            <label
                className={`
                    flex items-center cursor-pointer px-3 py-1
                    border border-gray-200
                    transition-colors
                    rounded-r-md
                    ${layout === "grid"
                        ? "bg-gray-800 text-white"
                        : "text-gray-800 hover:bg-gray-50"
                    }
                `}
            >
            <input
                type="radio"
                name="layout"
                value="grid"
                checked={layout === "grid"}
                onChange={() => setLayout("grid")}
                className="sr-only"
            />
            <BsGrid3X2Gap />
            </label>
        </div>

        {layout === "list" && (
            <>
                <div className="flex justify-between font-bold font-serif text-lg border-b-[1.2px] border-gray-500 mb-[7px]">
                    <h3> </h3>
                    <h3>Title</h3>
                    <h3>Last update</h3>
                    <h3> </h3>
                </div>
                <div className={`AllDocuments ${layout}`}>
                    {docs.map((doc) => (
                    <Link key={doc._id} to={`/doc/${doc._id}`} className="no-underline">
                        <DocumentCard doc={doc} layout={layout} onDeleted={() => setDocs(prev => prev.filter(d => d._id !== doc._id))} />
                    </Link>
                    ))}
                </div>
            </>
        )}

        {layout === "grid" && (
            <div className="flex flex-wrap gap-4 p-4">
                {docs.map((doc) => (
                    <Link key={doc._id} to={`/doc/${doc._id}`} className="no-underline">
                        <DocumentCard doc={doc} layout={layout} onDeleted={() => setDocs(prev => prev.filter(d => d._id !== doc._id))} />
                    </Link>
                    ))}
            </div>
        )}

        </section>
        );
}

export default AllDocuments;