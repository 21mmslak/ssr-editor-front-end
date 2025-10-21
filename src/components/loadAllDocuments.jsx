import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsListUl, BsGrid3X2Gap } from "react-icons/bs";
import { getDocuments } from "../api/api";
import AddDocumentButton from "./AddDocumentButton";
import DocumentCard from "./DocumentCard";

function AllDocuments() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

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
    <section className="bg-white rounded-lg">
      <div
        className="
                flex justify-end
                bg-white border border-white
                rounded-md
                p-2
                text-2xl
                "
        role="group"
        aria-label="Växla layout"
      >
        <AddDocumentButton />
        <label
          className={`
                    flex items-center cursor-pointer px-3 py-1
                    border border-gray-200
                    transition-colors
                    rounded-l-md
                    ${
                      layout === "list"
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
          <BsListUl />
        </label>
        <label
          className={`
                    flex items-center cursor-pointer px-3 py-1
                    border border-gray-200
                    transition-colors
                    rounded-r-md
                    ${
                      layout === "grid"
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
          <div
            className="
        grid grid-cols-[120px_1fr_200px_100px]
        font-bold font-serif text-lg
        border-b border-gray-500
        mb-2 px-5 py-2
        text-gray-800
      "
          >
            <h3>Filtyp</h3>
            <h3>Filnamn</h3>
            <h3>Senast uppdaterad</h3>
            <h3></h3>
          </div>

          <div className="AllDocuments list divide-y divide-gray-200">
            {docs.map((doc) => (
              <DocumentCard
                key={doc._id}
                doc={doc}
                layout={layout}
                onDeleted={() =>
                  setDocs((prev) => prev.filter((d) => d._id !== doc._id))
                }
              />
            ))}
          </div>
        </>
      )}

      {layout === "grid" && (
        <div className="flex flex-wrap gap-4 p-4">
          {docs.map((doc) => (
            <DocumentCard
              key={doc._id}
              doc={doc}
              layout={layout}
              onDeleted={() =>
                setDocs((prev) => prev.filter((d) => d._id !== doc._id))
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default AllDocuments;
