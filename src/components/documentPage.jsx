import React from "react";
import { useEffect, useState } from "react";
import {
  getDocument,
  updateDocument,
  deleteDocument,
  addCollaborator,
} from "../api/api";
import { useParams, useNavigate } from "react-router-dom";

const AUTO_SAVE = 900;

function DocumentPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [status, setStatus] = useState("Saved");
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const data = await getDocument(id);
      setDoc(data);
      setStatus("Saved");
    })();
  }, [id]);

  useEffect(() => {
    if (!doc) return;
    const t = setTimeout(async () => {
      try {
        setStatus("Saving...");
        await updateDocument(id, { title: doc.title, content: doc.content });
        setStatus("Saved");
      } catch (e) {
        console.error(e);
        setStatus("Editing...");
      }
    }, AUTO_SAVE);
    return () => clearTimeout(t);
  }, [id, doc]);

  async function shareNow() {
    if (!doc || !shareEmail) return;
    try {
      setStatus("Inviting collaborator...");
      await addCollaborator(id, shareEmail);
      setStatus("Collaborator invited");
    } catch (e) {
      console.error(e);
      setStatus("Failed to share...");
    }
    setShowSharePopup(false);
    setShareEmail("");
  }

  async function saveNow() {
    if (!doc) return;
    try {
      setStatus("Saving…");
      await updateDocument(id, { title: doc.title, content: doc.content });
      setStatus("Saved");
    } catch (e) {
      console.error(e);
      setStatus("Editing…");
    }
  }

  async function deleteNow() {
    try {
      await deleteDocument(id);
      navigate("/");
    } catch (err) {
      console.log("Failed to delete: ", err);
    }
  }

  if (!doc) return <p>Loading...</p>;

  return (
    <article className="">
      <div className="flex items-center gap-7 p-4">
        <div className="text-gray-700 font-medium">
          Save status:{" "}
          <span className="font-semibold text-blue-600">{status}</span>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={saveNow}
            className="px-4 py-1 rounded-lg bg-blue-500 text-white font-semibold shadow-sm hover:bg-blue-600 hover:shadow-md transition"
          >
            Save
          </button>
          <button
            type="button"
            onClick={deleteNow}
            className="px-4 py-1 rounded-lg bg-red-800 text-white font-semibold shadow-sm hover:bg-red-900 hover:shadow-md transition"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => setShowSharePopup(true)}
            className="px-4 py-1 rounded-lg bg-green-800 text-white font-semibold shadow-sm hover:bg-green-900 hover:shadow-md transition"
          >
            Dela
          </button>
        </div>
      </div>
      <div className="border-b-2">
        <input
          className=" w-full h-10 p-3 "
          value={doc.title || ""}
          onChange={(e) => {
            setDoc({ ...doc, title: e.target.value });
            setStatus("Editing…");
          }}
          placeholder="Untiteld"
        />
      </div>

      {showSharePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Bjud in</h2>
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="Enter email"
              className="border p-2 rounded"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSharePopup(false)}
                className="px-4 py-1 rounded bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={shareNow}
                className="px-4 py-1 rounded bg-blue-500 text-white"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      <textarea
        className="w-full p-3"
        value={doc.content || ""}
        onChange={(e) => {
          setDoc({ ...doc, content: e.target.value });
          setStatus("Editing…");
        }}
        rows={16}
        placeholder="Start type..."
      />
    </article>
  );
}

export default DocumentPage;

