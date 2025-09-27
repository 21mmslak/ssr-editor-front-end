import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../components/footer";

describe("Footer", () => {
  test("render one footer element (role=contentinfo)", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
  });

  test("Shows copyright-text footer", () => {
    render(<Footer />);
    expect(
      screen.getByText(/© 2025 ssr-editor – All rights reserved/i)
    ).toBeInTheDocument();
  });
});