import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";

jest.mock("react-router-dom", () => ({
  __esModule: true,
  BrowserRouter: ({ children }) => <>{children}</>,
  Routes: ({ children }) => <>{children}</>,
  Route: ({ element }) => element,
}), { virtual: true }); 

jest.mock("../components/header", () => () => <div data-testid="header" />);
jest.mock("../components/footer", () => () => <div data-testid="footer" />);
jest.mock("../components/loadAllDocuments", () => () => <div data-testid="all-docs" />);
jest.mock("../components/documentPage", () => () => <div data-testid="doc-page" />);
jest.mock("../components/addDocument", () => () => <div data-testid="add-doc" />);

test("App render without crach and show header and footer", () => {
  render(<App />);
  expect(screen.getByTestId("header")).toBeInTheDocument();
  expect(screen.getByTestId("footer")).toBeInTheDocument();
});