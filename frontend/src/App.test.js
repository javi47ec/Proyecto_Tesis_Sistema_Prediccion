import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";

test("renders main page", () => {
  render(<App />);
  expect(screen.getByText(/estudiantes/i)).toBeInTheDocument(); // Ajusta este texto según lo que aparece en tu página principal
});
