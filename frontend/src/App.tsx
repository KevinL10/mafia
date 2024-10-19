import React, { useContext, useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { SocketContext, SocketProvider } from "./SocketContext";
import { TestConnect } from "./Test";

function App() {
  const socket = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!socket) {
      console.log("no socket");
      return;
    }
    console.log("socket");
    // Connect to the server
    socket.connect();

    // Join the game room

    socket.on("pong", (data) => {
      console.log("pong");
      console.log(data);
    });

    console.log("emitting");
    socket.emit("ping", "w");

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketProvider>
      <div className="">
        <TestConnect />
      </div>
    </SocketProvider>
  );
}

export default App;
