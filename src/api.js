const API_URL = process.env.REACT_APP_API_URL || "https://jsramverk-boba24-d7a5f7cjfthdbycb.northeurope-01.azurewebsites.net";

export async function getDocuments() {
    const res = await fetch(`${API_URL}`);
    return res.json();
}

export async function getDocument(id) {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export async function updateDocument(id, patch) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export async function addDocumentApi(documentData) {
    const res = await fetch(`${API_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(documentData),
    });

    if (!res.ok) {
        throw new Error(`HTTP error, status: ${res.status}`)
    }

    return await res.json();
}

export async function deleteDocument(id) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        throw new Error(`HTTP error, status: ${res.status}`)
    }

    return true;
}