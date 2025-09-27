import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

jest.mock(
  "react-router-dom",
  () => ({
    __esModule: true,
    Link: ({ to, children, ...rest }) => (
      <a href={to} {...rest}>
        {children}
      </a>
    ),
  }),
  { virtual: true }
);

jest.mock("../api", () => ({
  getDocuments: jest.fn(),
  deleteDocument: jest.fn(),
}));

import { getDocuments, deleteDocument } from "../api";
import AllDocuments from "../components/loadAllDocuments";

const DOCS = [
  { _id: "a1", title: "Alpha", updatedAt: "2025-09-20T10:00:00Z" },
  { _id: "b2", title: "Beta", updatedAt: "2025-09-21T12:00:00Z" },
];

describe("AllDocuments + DocumentCard", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        const store = new Map();
        jest.spyOn(window.localStorage.__proto__, "getItem").mockImplementation((k) =>
        store.has(k) ? store.get(k) : null
        );
        jest.spyOn(window.localStorage.__proto__, "setItem").mockImplementation((k, v) =>
        store.set(k, String(v))
        );

        getDocuments.mockResolvedValue(DOCS);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("renders list layout by default and shows fetched docs", async () => {
        render(<AllDocuments />);

        await waitFor(() => {
        expect(getDocuments).toHaveBeenCalledTimes(1);
        });

        expect(screen.getByText("Alpha")).toBeInTheDocument();
        expect(screen.getByText("Beta")).toBeInTheDocument();

        const alphaLink = screen.getAllByRole("link").find((a) =>
        a.getAttribute("href")?.endsWith("/doc/a1")
        );
        const betaLink = screen.getAllByRole("link").find((a) =>
        a.getAttribute("href")?.endsWith("/doc/b2")
        );
        expect(alphaLink).toBeTruthy();
        expect(betaLink).toBeTruthy();
    });

    test("has an Add button linking to /addDocument", async () => {
        render(<AllDocuments />);
        await screen.findByText("Alpha");

        const addLink = screen
        .getAllByRole("link")
        .find((a) => a.getAttribute("href") === "/addDocument");
        expect(addLink).toBeTruthy();
    });

    test("toggles between list and grid and persists layout to localStorage", async () => {
        render(<AllDocuments />);
        await screen.findByText("Alpha");

        const group = screen.getByRole("group", { name: /Växla layout/i });

        const labels = group.querySelectorAll("label");
        expect(labels.length).toBeGreaterThanOrEqual(2);
        fireEvent.click(labels[1]);

        expect(window.localStorage.setItem).toHaveBeenCalledWith("layout", "grid");

        expect(screen.getByText("Alpha")).toBeInTheDocument();
        expect(screen.getByText("Beta")).toBeInTheDocument();

        fireEvent.click(labels[0]);
        expect(window.localStorage.setItem).toHaveBeenCalledWith("layout", "list");
    });

    test("opens kebab menu and deletes from list layout", async () => {
        deleteDocument.mockResolvedValue(true);

        render(<AllDocuments />);
        await screen.findByText("Alpha");

        const allButtons = screen.getAllByRole("button");
        const kebab = allButtons.find((b) => b.textContent === "" && b !== undefined);
        expect(kebab).toBeTruthy();

        fireEvent.click(kebab);

        const del = await screen.findByRole("menuitem", { name: /delete/i });
        fireEvent.click(del);

        await waitFor(() => {
        expect(deleteDocument).toHaveBeenCalledWith("a1");
        });

        await waitFor(() => {
        expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
        });

        expect(screen.getByText("Beta")).toBeInTheDocument();
    });

    test("clicking outside closes an open kebab menu in list layout", async () => {
        render(<AllDocuments />);
        await screen.findByText("Alpha");

        const allButtons = screen.getAllByRole("button");
        const kebab = allButtons.find((b) => b.textContent === "" && b !== undefined);
        fireEvent.click(kebab);

        const menuItem = await screen.findByRole("menuitem", { name: /delete/i });
        expect(menuItem).toBeInTheDocument();

        fireEvent.mouseDown(document.body);

        await waitFor(() => {
        expect(screen.queryByRole("menuitem", { name: /delete/i })).not.toBeInTheDocument();
        });
    });

    test("grid layout kebab delete also removes the card", async () => {
        deleteDocument.mockResolvedValue(true);

        window.localStorage.setItem("layout", "grid");

        render(<AllDocuments />);
        await screen.findByText("Alpha");

        const allButtons = screen.getAllByRole("button");
        const kebab = allButtons.find((b) => b.textContent === "" && b !== undefined);
        fireEvent.click(kebab);

        const del = await screen.findByRole("menuitem", { name: /delete/i });
        fireEvent.click(del);

        await waitFor(() => {
        expect(deleteDocument).toHaveBeenCalledWith("a1");
        });
        await waitFor(() => {
        expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
        });
    });

    test("List layout: delete error logs 'Misslyckades:' and keeps item", async () => {
        deleteDocument.mockRejectedValueOnce(new Error("Boom"));
        const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        render(<AllDocuments />);
        await screen.findByText("Alpha");

        const kebab = screen.getAllByRole("button").find(b => b.textContent === "");
        expect(kebab).toBeTruthy();
        fireEvent.click(kebab);
        const del = await screen.findByRole("menuitem", { name: /delete/i });
        fireEvent.click(del);

        await waitFor(() => {
            expect(deleteDocument).toHaveBeenCalledWith("a1");
            expect(errSpy).toHaveBeenCalledWith("Misslyckades:", expect.any(Error));
        });
        expect(screen.getByText("Alpha")).toBeInTheDocument();

        errSpy.mockRestore();
        });

        test("Grid layout: delete error logs 'Failed to delete: ' and keeps card", async () => {
        window.localStorage.setItem("layout", "grid");
        deleteDocument.mockRejectedValueOnce(new Error("Boom"));
        const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        render(<AllDocuments />);
        await screen.findByText("Alpha");

        const kebab = screen.getAllByRole("button").find(b => b.textContent === "");
        expect(kebab).toBeTruthy();
        fireEvent.click(kebab);
        const del = await screen.findByRole("menuitem", { name: /delete/i });
        fireEvent.click(del);

        await waitFor(() => {
            expect(deleteDocument).toHaveBeenCalledWith("a1");
            expect(errSpy).toHaveBeenCalledWith("Failed to delete: ", expect.any(Error));
        });
        expect(screen.getByText("Alpha")).toBeInTheDocument();

        errSpy.mockRestore();
    });
});