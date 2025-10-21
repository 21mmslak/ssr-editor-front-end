import React, { useState } from "react";
import { addCollaborator } from "../api/api";

export default function SharePopup({ isOpen, onClose, onSuccess, id }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    setStatus("");

    try {
      setStatus("Inviting collaborator...");
      await addCollaborator(id, email);
      setStatus("Collaborator invited");
      setEmail("");
      if (onSuccess) onSuccess(email);
    } catch (err) {
      console.error(err);
      setError("Failed to share. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
			fixed inset-0 bg-black/50
			flex items-center
			justify-center z-50"
    >
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-3">Dela dokument</h2>
        <form
          onSubmit={handleSubmit}
          className="
					flex flex-col gap-3"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kompis@example.com"
            className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />

          {status && (
            <div className="text-sm text-blue-600 font-medium">{status}</div>
          )}
          {error && (
            <div className="text-sm text-red-600 font-medium">{error}</div>
          )}

          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                setEmail("");
                onClose();
              }}
              disabled={loading}
              className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? "Bjuder in..." : "Bjud in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
