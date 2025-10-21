import React, { useEffect, useRef, useState } from "react";
import { getDocument, updateDocument, deleteDocument } from "../api/api";
import { useParams, useNavigate } from "react-router-dom";
import { connectSocket } from "../api/sockets";
import { diff, patch, deepClone } from "../utils/diffpatch";
import SharePopup from "./SharePopup";

const AUTO_SAVE = 900;

function DocumentPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [status, setStatus] = useState("Saved");
  const [showSharePopup, setShowSharePopup] = useState(false);
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const baselineRef = useRef(null);

  useEffect(() => {
    (async () => {
      const data = await getDocument(id);
      setDoc(data);
      baselineRef.current = {
        title: data.title ?? "",
        content: data.content ?? "",
      };
      setStatus("Saved");
    })();
  }, [id]);

  useEffect(() => {
    const s = connectSocket();
    socketRef.current = s;
    s.emit("join", id);

    s.on("doc", ({ _id, delta }) => {
      if (_id !== id || !delta) return;

      setDoc((prev) => {
        if (!prev) return prev;
        const next = deepClone(prev);
        const target = { title: next.title ?? "", content: next.content ?? "" };
        patch(target, delta);
        next.title = target.title;
        next.content = target.content;
        return next;
      });

      if (baselineRef.current) {
        const b = deepClone(baselineRef.current);
        patch(b, delta);
        baselineRef.current = b;
      }

      setStatus("Live update");
    });

    return () => {
      s.off("doc");
      s.disconnect();
      socketRef.current = null;
    };
  }, [id]);

  function emitDeltaDebounced(nextShape) {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      const base = baselineRef.current ?? { title: "", content: "" };
      const delta = diff(base, nextShape);
      if (delta) {
        socketRef.current?.emit("doc", { _id: id, delta });
        baselineRef.current = deepClone(nextShape);
      }
    }, 150);
  }

  useEffect(() => {
    if (!doc) return;
    const t = setTimeout(async () => {
      try {
        setStatus("Saving...");
        await updateDocument(id, { title: doc.title, content: doc.content });
        baselineRef.current = {
          title: doc.title ?? "",
          content: doc.content ?? "",
        };
        setStatus("Saved");
      } catch (e) {
        console.error(e);
        setStatus("Editing…");
      }
    }, AUTO_SAVE);
    return () => clearTimeout(t);
  }, [id, doc]);

  async function saveNow() {
    if (!doc) return;
    try {
      setStatus("Saving…");
      await updateDocument(id, { title: doc.title, content: doc.content });
      baselineRef.current = {
        title: doc.title ?? "",
        content: doc.content ?? "",
      };
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

  const onTitleChange = (e) => {
    const title = e.target.value;
    const nextShape = { title, content: doc.content ?? "" };
    setDoc({ ...doc, title });
    setStatus("Editing…");
    emitDeltaDebounced(nextShape);
  };

  const onContentChange = (e) => {
    const content = e.target.value;
    const nextShape = { title: doc.title ?? "", content };
    setDoc({ ...doc, content });
    setStatus("Editing…");
    emitDeltaDebounced(nextShape);
  };

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
          className="w-full h-10 p-3"
          value={doc.title || ""}
          onChange={onTitleChange}
          placeholder="Untitled"
        />
      </div>

      <SharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        id={id}
        onSuccess={(email) => console.log("Shared with:", email)}
      />

      <textarea
        className="w-full p-3"
        value={doc.content || ""}
        onChange={onContentChange}
        rows={16}
        placeholder="Start typing..."
      />
    </article>
  );
}

export default DocumentPage;
