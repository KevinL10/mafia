import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { SocketProvider } from "./SocketContext.tsx";
import { Home } from "./pages/Home.tsx";
import Game from "./pages/Game.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/game",
    element: <Game />,
  },
]);

createRoot(document.getElementById("root")!).render(
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
);
