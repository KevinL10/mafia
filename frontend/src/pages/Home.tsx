import React, { useContext, useEffect, useState } from "react";
import { SocketContext, SocketProvider } from "../SocketContext";
import { useNavigate } from "react-router-dom";

export function Home() {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();

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
      <div>
        <button onClick={() => 
          navigate("/game")
        }>start game </button>
      </div>
  );
}

