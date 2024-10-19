import { useContext, useState } from "react";
import { SocketContext } from "../SocketContext";

export default function Chat({history, setHistory}: {history: Array<[string, string]>, setHistory: (value: Array<[string, string]> ) => void}) {
  const socket = useContext(SocketContext);
  // const [history, setHistory] = useState<Array<[string, string]>>([]);
  const [message, setMessage] = useState("");

  return (
    <div className="border rounded-md">
      <div>
        {history.map((m, i) => (
          <div key={m[1] + i}>{m[0]}: {m[1]}</div>
        ))}
      </div>

      <input
        className="w-full"
        placeholder="your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setHistory([...history, ["you", message]]);
            setMessage("");

            socket?.emit("chat", message)
          }
        }}
      />
    </div>
  );
}
