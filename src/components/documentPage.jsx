import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { BsSave, BsShare, BsTrash } from "react-icons/bs";
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

  const onContentChange = (input) => {
    const content =
      typeof input === "string" ? input : (input?.target?.value ?? "");
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
            className="flex items-center gap-2 px-4 py-1 rounded-lg bg-blue-500 text-white font-semibold shadow-sm hover:bg-blue-600 hover:shadow-md transition"
          >
            <BsSave />
            <span>Spara</span>
          </button>
          <button
            type="button"
            onClick={deleteNow}
            className="flex items-center gap-2 px-4 py-1 rounded-lg bg-red-800 text-white font-semibold shadow-sm hover:bg-red-900 hover:shadow-md transition"
          >
            <BsTrash />
            <span>Radera</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSharePopup(true)}
            className="flex items-center gap-2 px-4 py-1 rounded-lg bg-green-800 text-white font-semibold shadow-sm hover:bg-green-900 hover:shadow-md transition"
          >
            <BsShare />
            <span>Dela</span>
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

      {doc.type === "code" ? (
        <div className="border-t border-gray-200">
          <Editor
            height="50vh"
            theme="vs"
            language="javascript"
            value={doc.content || ""}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
            onChange={onContentChange}
          />
          <div className="flex justify-end mt-3 px-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  const code = btoa(
                    unescape(encodeURIComponent(doc.content || "")),
                  );
                  const res = await fetch("https://execjs.emilfolino.se/code", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code }),
                  });

                  if (!res.ok) throw new Error("Couldnt execute");

                  const result = await res.json();
                  console.log("Exekverad kod:", atob(result.data));
                } catch (err) {
                  console.error(err);
                }
              }}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
            >
              Exekvera
            </button>
          </div>
        </div>
      ) : (
        <textarea
          className="w-full p-3"
          value={doc.content || ""}
          onChange={onContentChange}
          rows={16}
          placeholder="Start typing..."
        />
      )}
    </article>
  );
}

export default DocumentPage;
