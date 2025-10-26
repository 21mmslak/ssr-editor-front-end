import React, { useEffect, useState } from "react";
import { listComments, createComment, updateComment, deleteComment } from "../api/comments";
import { FiSend, FiTrash2, FiMessageSquare } from "react-icons/fi";

export default function CommentsPanel({ docId, socket, getAnchor, onSelectAnchor }) {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      const cs = await listComments(docId);
      if (mounted) setItems(cs);
    })();

    if (!socket) return () => { mounted = false; };

    socket.emit("join", docId);

    const onAdded = ({ comment }) => {
      if (!comment || !comment._id) return;
      setItems(prev => (prev.some(c => c._id === comment._id) ? prev : [...prev, comment]));
    };

    const onUpdated = ({ id, patch }) => {
      setItems(prev => prev.map(c =>
        c._id === id
          ? { ...c, ...patch, anchor: { ...c.anchor, ...(patch?.anchor || {}) } }
          : c
      ));
    };

    const onDeleted = ({ id }) => {
      setItems(prev => prev.filter(c => c._id !== id));
    };

    socket.on("comment:added", onAdded);
    socket.on("comment:updated", onUpdated);
    socket.on("comment:deleted", onDeleted);

    return () => {
      socket.off("comment:added", onAdded);
      socket.off("comment:updated", onUpdated);
      socket.off("comment:deleted", onDeleted);
      mounted = false;
    };
  }, [docId, socket]);

  async function add() {
    if (!text.trim()) return;
    const anchor = typeof getAnchor === "function" ? getAnchor() : null;
    if (!anchor) return;

    try {
      const created = await createComment(docId, anchor, text.trim());
      setText("");
      setItems(prev => (prev.some(c => c._id === created._id) ? prev : [...prev, created]));
    } catch (e) {
      console.error(e);
    }
  }

  async function remove(c, e) {
    e?.stopPropagation();
    try {
      await deleteComment(c._id, docId);
    } catch (e2) {
      console.error(e2);
    }
  }

  return (
    <aside className="border-l w-full md:w-80 p-4 space-y-4 bg-gray-50/50">
      <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
        <FiMessageSquare className="text-blue-600" />
        Comment
      </h2>

      <div className="space-y-2 bg-white rounded-lg shadow-sm border p-3">
        <textarea
          className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
          rows={3}
          placeholder="Write a comment to marked text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={add}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          <FiSend className="text-sm" />
          Add Comment
        </button>
        <p className="text-xs text-gray-500 text-center">
          Mark text in doc, write a comment and post.
        </p>
      </div>

      <ul className="space-y-3">
        {items.map((c) => (
          <li
            key={c._id}
            onClick={() => onSelectAnchor?.({ id: c._id, anchor: c.anchor })}
            className={`bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-pointer ${
              c.resolved ? "opacity-70" : ""
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500">
                  Row{" "}
                  <span className="font-medium text-gray-700">
                    {c.anchor.startLine + 1}:{c.anchor.startCh} –{" "}
                    {c.anchor.endLine + 1}:{c.anchor.endCh}
                  </span>
                  {c.resolved && (
                    <span className="ml-1 text-green-600 font-semibold">✔</span>
                  )}
                </p>
                <p className="mt-1 text-sm text-gray-800 leading-snug">
                  {c.text}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  remove(c);
                }}
                className="text-gray-400 hover:text-red-600 transition"
                title="Delete"
              >
                <FiTrash2 className="text-base" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
