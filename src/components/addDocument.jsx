import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addDocumentApi } from "../api/api";

export default function AddDocumentAction() {
  const navigate = useNavigate();
  const { type } = useParams();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    (async () => {
      try {
        const newDoc = await addDocumentApi({
          title: "",
          content: "",
          type,
        });
        const docId = newDoc._id;
        navigate(`/doc/${docId}`, { replace: true });
      } catch (err) {
        console.error(err);
        navigate("/", { replace: true });
      }
    })();
  }, [navigate]);

  return null;
}
