import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Call from "./call";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    element: <Call />,
    path: "/call/:roomID",
  },
]);
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
