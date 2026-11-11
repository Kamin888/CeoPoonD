import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ApartmentHome from "./ApartmentHome.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ApartmentHome />
  </StrictMode>
);
