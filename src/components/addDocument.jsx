import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { addDocumentApi } from "../api";

export default function AddDocumentAction() {
    const navigate = useNavigate();
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        (async () => {
        try {
            const newDoc = await addDocumentApi({ title: "", content: "" });
            navigate(`/ssr-editor-front-end/doc/${newDoc._id}`, { replace: true });
        } catch (err) {
            console.error(err);
            navigate("/ssr-editor-front-end/", { replace: true });
        }
        })();
    }, [navigate]);

    return null;
}