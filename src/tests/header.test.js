import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock(
  "react-router-dom",
  () => ({
    __esModule: true,
    Link: ({ to, children, ...rest }) => (
      <a href={to} {...rest}>{children}</a>
    ),
  }),
  { virtual: true }
);

import Header from "../components/header";

describe("Header", () => {
  test("render header-elementet", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  test("show logo and link", () => {
    render(<Header />);
    const logo = screen.getByAltText("Logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "docImg.png");

    const link = logo.closest("a");
    expect(link).toHaveAttribute("href", "/");
  });

  test("render serarch and placeholder", () => {
    render(<Header />);
    const input = screen.getByPlaceholderText("Sök, en dag kanske det funkar...");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });
});