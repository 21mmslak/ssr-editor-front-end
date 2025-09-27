import {
  getDocuments,
  getDocument,
  updateDocument,
  addDocumentApi,
  deleteDocument,
} from "../api.js";

global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

describe("API functions", () => {
    
  test("getDocuments should fetch all docs", async () => {
    const mockData = [{ id: 1, title: "Mocked Doc" }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const res = await getDocuments();

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("https://"));
    expect(res).toEqual(mockData);
  });

  test("getDocument should fetch one doc by id", async () => {
    const mockData = [{ id: 2, title: "Mocked Doc" }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const res = await getDocument(2);

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/2"));
    expect(res).toEqual(mockData);
  });

  test("getDocument should throw error", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });

    await expect(getDocument(999)).rejects.toThrow("HTTP 404");
  });

  test("updateDocument should update the doc", async () => {
    const mockData = [{ id: 3, title: "Update me" }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const patch = { tilte: "Updated" };
    const res = await updateDocument(3, patch);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/3"),
      expect.objectContaining({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      })
    );
    expect(res).toEqual(mockData);
  });

  test("updateDocument should throw error", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 400 });

    await expect(updateDocument({ title: "Fail" })).rejects.toThrow(
      "HTTP 400"
    );
  });

  test("addDocumentApi", async () => {
    const mockData = [{ id: 4, tilte: "New doc" }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const newDoc = { title: "New doc" };
    const res = await addDocumentApi(newDoc);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoc)
      })
    );
    expect(res).toEqual(mockData);
  });

  test("addDocumentApi should throw error", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(addDocumentApi({ title: "Fail" })).rejects.toThrow(
      "HTTP error, status: 500"
    );
  });

  test("deleteDocument should delete a doc", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    const res = await deleteDocument("/123");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/123"),
      {method: "DELETE"}
    );
    expect(res).toBe(true);
  });

  test("deleteDocument thorw error", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 403 });

    await expect(deleteDocument(10)).rejects.toThrow(
      "HTTP error, status: 403"
    );
  });
});