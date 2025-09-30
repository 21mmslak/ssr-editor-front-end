import "@testing-library/jest-dom";
import React from "react";
import { render, waitFor, cleanup, act, screen, fireEvent } from "@testing-library/react";

const mockNavigate = jest.fn();
jest.mock(
    "react-router-dom",
    () => ({
        __esModule: true,
        useNavigate: () => mockNavigate,
        useParams: () => ({ id: "123" })
    }),
    { virtual: true }
);

jest.mock("../api", () => ({
    getDocument: jest.fn(),
    updateDocument: jest.fn(),
    deleteDocument: jest.fn()
}));

import { getDocument, updateDocument, deleteDocument } from "../api";
import DocumentPage from "../components/documentPage";
import { replace, useParams } from "react-router-dom";


beforeEach(() => {
    jest.clearAllMocks();
})
afterEach(() => {
    jest.useRealTimers();
});

describe("documentPageAction", () => {
    
    test("documentPage loads doc", async () => {
        getDocument.mockResolvedValueOnce({ _id: "123", title: "TestDoc", content: "hello" });

        render(<DocumentPage />);

        await screen.findByDisplayValue("TestDoc");
        await screen.findByDisplayValue("hello");

        expect(getDocument).toHaveBeenCalledWith("123");
    });

    test("documentPage autosave", async () => {
        jest.useFakeTimers();

        getDocument.mockResolvedValueOnce({ _id: "123", title: "TestDoc", content: "hello" });
        updateDocument.mockResolvedValueOnce({ _id: "123", title: "TestDoc", content: "hello" });

        render(<DocumentPage />);

        await screen.findByDisplayValue("TestDoc");
        await screen.findByDisplayValue("hello");

        await act(async () => {
        jest.runOnlyPendingTimers();
        });

        await waitFor(() =>
        expect(updateDocument).toHaveBeenCalledWith("123", {
            title: "TestDoc",
            content: "hello",
        })
        );

        expect(screen.getByText(/Saved/i)).toBeInTheDocument();
    });

    test("documentPage autosave fail", async () => {
        jest.useFakeTimers();

        getDocument.mockResolvedValueOnce({ _id: "123", title: "TestDoc", content: "hello" });
        updateDocument.mockRejectedValueOnce(new Error("Boom"));
    
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});

        render(<DocumentPage />);

        await screen.findByDisplayValue("TestDoc");
        await screen.findByDisplayValue("hello");

        await act(async () => {
            jest.runOnlyPendingTimers();
        });

        expect(updateDocument).toHaveBeenCalledTimes(1);

        await screen.findByText(/Editing/i);

        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    test("documentPage saveNow()", async () => {
        getDocument.mockResolvedValueOnce({ _id: "123", title: "TestDoc", content: "hello" });
        updateDocument.mockResolvedValueOnce({ _id: "123", title: "TestDoc", content: "hello" });

        render(<DocumentPage />);

        await screen.findByDisplayValue("TestDoc");
        await screen.findByDisplayValue("hello");

        const saveBtn = screen.getByRole("button", { name: /save/i });
        fireEvent.click(saveBtn);

        await waitFor(() => 
            expect(updateDocument).toHaveBeenCalledWith("123", { title: "TestDoc", content: "hello" })    
        );
    });

    test("documentPage saveNow() Error", async () => {
        getDocument.mockResolvedValueOnce({ _id: "123", title: "TestDoc", content: "hello" });
        updateDocument.mockRejectedValueOnce(new Error("Boom"));
    
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});

        render(<DocumentPage />);

        await screen.findByDisplayValue("TestDoc");
        await screen.findByDisplayValue("hello");
    
        fireEvent.click(screen.getByRole("button", { name: /save/i }));

        await waitFor(() => expect(updateDocument).toHaveBeenCalledTimes(1));
        expect(spy).toHaveBeenCalled();

        spy.mockRestore();
    });

    test("documentPage deleteNow() Error", async () => {
        getDocument.mockResolvedValueOnce({ _id: "123", title: "TestDoc", content: "hello" });
        deleteDocument.mockRejectedValueOnce(new Error("Boom"));

        const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

        render(<DocumentPage />);

        await screen.findByDisplayValue("TestDoc");
        await screen.findByDisplayValue("hello");

        fireEvent.click(screen.getByRole("button", { name: /delete/i }));

        await waitFor(() => {
            expect(deleteDocument).toHaveBeenCalledWith("123");
            expect(logSpy).toHaveBeenCalledWith("Failed to delete: ", expect.any(Error));
            expect(mockNavigate).not.toHaveBeenCalled();
        });

        logSpy.mockRestore();
    });

    test("documentPage deleteNow()", async () => {
        getDocument.mockResolvedValueOnce({ _id: "123", title: "TestDoc", content: "hello" });
        // updateDocument.mockResolvedValueOnce({ _id: "123", title: "TestDoc", content: "hello" });

        render(<DocumentPage />);

        await screen.findByDisplayValue("TestDoc");
        await screen.findByDisplayValue("hello");

        const deleteBtn = screen.getByRole("button", { name: /delete/i });
        fireEvent.click(deleteBtn);

        await waitFor(() => 
            expect(deleteDocument).toHaveBeenCalledWith("123")    
        );
    });

    test("documentPage title change and status edeting", async () => {
        getDocument.mockResolvedValueOnce({ id: "123", title: "TestDoc", content: "hello" });

        render(<DocumentPage />);

        const titleInput = await screen.findByPlaceholderText(/Untiteld/i);
        const contentInput = await screen.findByPlaceholderText(/Start type/i);
    
        expect(titleInput).toHaveValue("TestDoc");
        expect(contentInput).toHaveValue("hello");

        fireEvent.change(titleInput, { target: { value: "Edit doc" } });

        expect(titleInput).toHaveValue("Edit doc");
        expect(screen.getByText(/Editing/i)).toBeInTheDocument();
    });

    test("documentPage content change and status edeting", async () => {
        getDocument.mockResolvedValueOnce({ id: "123", title: "TestDoc", content: "hello" });

        render(<DocumentPage />);

        const titleInput = await screen.findByPlaceholderText(/Untiteld/i);
        const contentInput = await screen.findByPlaceholderText(/Start type/i);
    
        expect(titleInput).toHaveValue("TestDoc");
        expect(contentInput).toHaveValue("hello");

        fireEvent.change(contentInput, { target: { value: "Edit doc" } });

        expect(contentInput).toHaveValue("Edit doc");
        expect(screen.getByText(/Editing/i)).toBeInTheDocument();
    });
});