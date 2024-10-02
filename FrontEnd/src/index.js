import React from "react";
import ReactDOM from "react-dom/client"; // updated import
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root")); // updated root
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
