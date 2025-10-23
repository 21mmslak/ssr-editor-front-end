import { useEffect, useRef } from "react";
import { connectSocket } from "../api/sockets";
import { diff, patch, deepClone } from "../utils/diffpatch";

export default function useDocRealtime({ docId, setDoc, baselineRef, onStatus }) {
  const socketRef = useRef(null);
  const debounceRef = useRef(null);

  const applyDelta = (delta) => {
    if (!delta) return;
    setDoc((prev) => {
      if (!prev) return prev;
      const next = deepClone(prev);
      const target = { title: next.title ?? "", content: next.content ?? "" };
      patch(target, delta);
      next.title = target.title;
      next.content = target.content;
      return next;
    });
    if (!baselineRef.current) return;
    const b = deepClone(baselineRef.current);
    patch(b, delta);
    baselineRef.current = b;
    onStatus?.("Live update");
  };

  useEffect(() => {
    const s = connectSocket();
    socketRef.current = s;
    s.emit("join", docId);

    const onDoc = ({ _id, delta }) => (_id === docId) && applyDelta(delta);
    s.on("doc", onDoc);

    return () => {
      s.off("doc", onDoc);
      s.disconnect();
      socketRef.current = null;
    };
  }, [docId]);

  const emitDeltaDebounced = (nextShape) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const base = baselineRef.current ?? { title: "", content: "" };
      const delta = diff(base, nextShape);
      if (!delta) return;
      socketRef.current?.emit("doc", { _id: docId, delta });
      baselineRef.current = deepClone(nextShape);
    }, 150);
  };

  return { socketRef, emitDeltaDebounced };
}