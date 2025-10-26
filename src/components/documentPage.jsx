import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { BsSave, BsShare, BsTrash } from "react-icons/bs";
import { getDocument, updateDocument, deleteDocument } from "../api/api";
import { useParams, useNavigate } from "react-router-dom";
import SharePopup from "./SharePopup";
import CommentsPanel from "../components/CommentsPanel";

import useDocRealtime from "./useDocRealtime";
import { getAnchor, highlightAnchor, clearHighlight } from "./anchorHighlight";

const AUTO_SAVE = 900;

export default function DocumentPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [status, setStatus] = useState("Saved");
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const navigate = useNavigate();

  const baselineRef = useRef(null);
  const textareaRef = useRef(null);
  const monacoRef = useRef(null);
  const decoRef = useRef([]);

  const [execRunning, setExecRunning] = useState(false);
  const [execResult, setExecResult] = useState("");

  useEffect(() => {
    (async () => {
      const data = await getDocument(id);
      setDoc(data);
      baselineRef.current = { title: data.title ?? "", content: data.content ?? "" };
      setStatus("Saved");
    })();
  }, [id]);

  const { socketRef, emitDeltaDebounced } = useDocRealtime({
    docId: id,
    setDoc,
    baselineRef,
    onStatus: setStatus,
  });

  useEffect(() => {
    if (!doc) return;
    const t = setTimeout(async () => {
      try {
        setStatus("Saving...");
        await updateDocument(id, { title: doc.title, content: doc.content });
        baselineRef.current = { title: doc.title ?? "", content: doc.content ?? "" };
        setStatus("Saved");
      } catch {
        setStatus("Editing…");
      }
    }, AUTO_SAVE);
    return () => clearTimeout(t);
  }, [id, doc]);

  const saveNow = async () => {
    if (!doc) return;
    try {
      setStatus("Saving…");
      await updateDocument(id, { title: doc.title, content: doc.content });
      baselineRef.current = { title: doc.title ?? "", content: doc.content ?? "" };
      setStatus("Saved");
    } catch {
      setStatus("Editing…");
    }
  };

  const deleteNow = async () => {
    await deleteDocument(id).catch(() => null);
    navigate("/");
  };

  if (!doc) return <p>Loading...</p>;

  const onTitleChange = (e) => {
    const title = e.target.value;
    setDoc((d) => ({ ...d, title }));
    setStatus("Editing…");
    emitDeltaDebounced({ title, content: doc.content ?? "" });
  };

  const onContentChange = (input) => {
    const content = typeof input === "string" ? input : (input?.target?.value ?? "");
    setDoc((d) => ({ ...d, content }));
    setStatus("Editing…");
    emitDeltaDebounced({ title: doc.title ?? "", content });
  };

  const readAnchor = () => getAnchor(doc, monacoRef, textareaRef);

  const handleSelectAnchor = ({ id: commentId, anchor }) => {
    if (selectedCommentId === commentId) {
      clearHighlight(doc, monacoRef, textareaRef, decoRef);
      setSelectedCommentId(null);
      return;
    }
    setSelectedCommentId(commentId);
    highlightAnchor(doc, anchor, monacoRef, textareaRef, decoRef);
  };

async function runCode() {
  try {
    setExecRunning(true);
    setExecResult("");

    const code = btoa(unescape(encodeURIComponent(doc.content || "")));
    const res = await fetch("https://execjs.emilfolino.se/code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!res.ok) throw new Error("Couldnt execute");

    const result = await res.json();
    setExecResult(atob(result.data));
  } catch (err) {
    setExecResult(String(err.message || err));
  } finally {
    setExecRunning(false);
  }
}

  return (
    <article className="md:flex">
      <div className="flex-1">
        <div className="flex items-center gap-7 p-4">
          <div className="text-gray-700 font-medium">
            Save status: <span className="font-semibold text-blue-600">{status}</span>
          </div>
          <div className="flex gap-1">
            <button type="button" onClick={saveNow} className="flex items-center gap-2 px-4 py-1 rounded-lg bg-blue-500 text-white font-semibold shadow-sm hover:bg-blue-600 hover:shadow-md transition">
              <BsSave /><span>Spara</span>
            </button>
            <button type="button" onClick={deleteNow} className="flex items-center gap-2 px-4 py-1 rounded-lg bg-red-800 text-white font-semibold shadow-sm hover:bg-red-900 hover:shadow-md transition">
              <BsTrash /><span>Radera</span>
            </button>
            <button type="button" onClick={() => setShowSharePopup(true)} className="flex items-center gap-2 px-4 py-1 rounded-lg bg-green-800 text-white font-semibold shadow-sm hover:bg-green-900 hover:shadow-md transition">
              <BsShare /><span>Dela</span>
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
              onMount={(editor) => { monacoRef.current = editor; }}
              onChange={onContentChange}
            />

            <div className="flex justify-end mt-3 px-3">
              <button
                type="button"
                onClick={runCode}
                disabled={execRunning}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold disabled:opacity-60 hover:bg-indigo-700 transition"
              >
                {execRunning ? "Kör…" : "Exekvera"}
              </button>
            </div>

            {execResult && (
              <pre className="m-3 p-3 border rounded bg-gray-50 text-sm whitespace-pre-wrap">
                {execResult}
              </pre>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            className="w-full p-3"
            value={doc.content || ""}
            onChange={onContentChange}
            rows={16}
            placeholder="Start typing..."
          />
        )}
      </div>

      {socketRef.current && (
        <CommentsPanel
          docId={id}
          socket={socketRef.current}
          getAnchor={readAnchor}
          onSelectAnchor={handleSelectAnchor}
        />
      )}
    </article>
  );
}