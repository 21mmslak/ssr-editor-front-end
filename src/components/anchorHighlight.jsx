const toAbs = (text, line, ch) =>
  text.split("\n").slice(0, line).join("\n").length + (line ? 1 : 0) + ch;

export const getAnchor = (doc, monacoRef, taRef) => {
  const isCode = doc?.type === "code";
  if (isCode) {
    const sel = monacoRef.current?.getSelection();
    if (!sel) return null;
    return {
      startLine: sel.startLineNumber - 1,
      startCh:   sel.startColumn - 1,
      endLine:   sel.endLineNumber - 1,
      endCh:     sel.endColumn - 1,
    };
  }

  const el = taRef.current;
  if (!el) return null;

  const value = el.value ?? "";
  const start = el.selectionStart ?? 0;
  const end   = el.selectionEnd ?? start;

  const pre = (i) => value.slice(0, i);
  const countNL = (s) => (s.match(/\n/g) || []).length;
  const lastIdx = (s) => s.lastIndexOf("\n");

  const preStart = pre(start), preEnd = pre(end);
  const startLine = countNL(preStart);
  const endLine   = countNL(preEnd);
  const startCh   = start - (lastIdx(preStart) + 1);
  const endCh     = end   - (lastIdx(preEnd) + 1);

  return { startLine, startCh, endLine, endCh };
};

export const highlightAnchor = (doc, anchor, monacoRef, taRef, decoRef) => {
  if (!anchor) return;
  const isCode = doc?.type === "code";

  if (isCode && monacoRef.current && window.monaco) {
    const { startLine, startCh, endLine, endCh } = anchor;
    const range = new window.monaco.Range(startLine + 1, startCh + 1, endLine + 1, endCh + 1);
    decoRef.current = monacoRef.current.deltaDecorations(decoRef.current, [
      { range, options: { inlineClassName: "bg-yellow-200 rounded-sm" } },
    ]);
    monacoRef.current.revealRangeInCenter(range);
    return;
  }

  const el = taRef.current;
  if (!el) return;
  const startAbs = toAbs(el.value ?? "", anchor.startLine, anchor.startCh);
  const endAbs   = toAbs(el.value ?? "", anchor.endLine,   anchor.endCh);
  el.focus();
  el.setSelectionRange(startAbs, endAbs);
};

export const clearHighlight = (doc, monacoRef, taRef, decoRef) => {
  if (doc?.type === "code" && monacoRef.current) {
    decoRef.current = monacoRef.current.deltaDecorations(decoRef.current, []);
  }
  const el = taRef.current;
  if (!el) return;
  const end = (el.value ?? "").length;
  el.setSelectionRange(end, end);
};