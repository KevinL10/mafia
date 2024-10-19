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
      <div>
        <p>what's your name?</p>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={() => 
          navigate("/game", name)
        }>start game </button>
      </div>
  );
}

