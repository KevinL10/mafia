import React, { useContext, useEffect, useState } from "react";
import { SocketContext, SocketProvider } from "../SocketContext";
import { useNavigate } from "react-router-dom";

export function Home() {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const [name, setName] = useState("")

  useEffect(() => {
    if(!socket) return;


    socket.on("msg", (data) => {
      console.log(data)
    })

    socket.on("error", (data) => {
      console.error(data)
    })
  }, [socket])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p className="text-xl mb-4 text-center">What's your name?</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your name"
        />
        <button
          onClick={() => navigate("/game")}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
