import "@testing-library/jest-dom";
import React from "react";
import { render, waitFor, cleanup } from "@testing-library/react";

const mockNavigate = jest.fn();
jest.mock(
    "react-router-dom",
    () => ({
        __esModule: true,
        useNavigate: () => mockNavigate
    }),
    { virtual: true }
);

jest.mock("../api", () => ({
    addDocumentApi: jest.fn()
}));

import { addDocumentApi } from "../api";
import AddDocumentAction from "../components/addDocument";
import { replace } from "react-router-dom";

afterEach(() => {
    cleanup();
    jest.clearAllMocks();
});

describe("AddDocumentAction", () => {

    test("Navigate to /doc/:id when sucsessfully adds a doc", async () => {
        addDocumentApi.mockResolvedValueOnce({ _id: "abc123" });

        render(< AddDocumentAction />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/doc/abc123", { replace: true}));

        expect(addDocumentApi).toHaveBeenCalledTimes(1);
        expect(addDocumentApi).toHaveBeenCalledWith({ title: "", content: "" });
    });

    test("Navigate to / when failed to add a doc", async () => {
        addDocumentApi.mockRejectedValueOnce(new Error("Boom"));

        const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        render(< AddDocumentAction />);

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true}));

        errSpy.mockRestore();
        expect(addDocumentApi).toHaveBeenCalledTimes(1);
    });

    test("Only run one time id re-renderd", async () => {
        addDocumentApi.mockResolvedValueOnce({ _id: "once" });

        const { rerender } = render(<AddDocumentAction />);
        rerender(<AddDocumentAction />);

        await waitFor(() =>
            expect(mockNavigate).toHaveBeenCalledWith("/doc/once", { replace: true })
        );
        expect(addDocumentApi).toHaveBeenCalledTimes(1);
    });

    test("Only run effekt one time in stictmode", async () => {
        addDocumentApi.mockResolvedValueOnce({ _id: "guard" });

        render(
            <React.StrictMode>
                <AddDocumentAction />
            </React.StrictMode>
        );

        await waitFor(() => 
            expect(mockNavigate).toHaveBeenCalledWith("/doc/guard", { replace: true })
        );

        expect(addDocumentApi).toHaveBeenCalledTimes(1);
    });
})
