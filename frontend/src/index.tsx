import React from "react";
import { createRoot } from "react-dom/client";
import Home from "./containers/Home";
import "./index.css";

const container = document.getElementById("app-root")!;
const root = createRoot(container);
root.render(<Home />);
