import { useContext, useEffect } from "react";
import { SocketContext } from "./SocketContext";

export function TestConnect() {
  const socket = useContext(SocketContext);

  useEffect(() => {
    if(!socket) {
      console.log('no socket')
      return;
    }
    console.log('socket')
    // Connect to the server
    socket.connect();

    // Join the game room

    socket.on('pong', (data) => {
      console.log('pong')
      console.log(data)
    })

    console.log('emitting')
    socket.emit('ping', "w");

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [socket]);
  return <>
  <div>test connection</div>
  </>
}