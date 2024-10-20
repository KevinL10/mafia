import { useContext, useState } from "react";
import { SocketContext } from "../SocketContext";

export default function Chat({
  history,
  setHistory,
}: {
  history: Array<[string, string]>;
  setHistory: (value: Array<[string, string]>) => void;
}) {
  const socket = useContext(SocketContext);
  // const [history, setHistory] = useState<Array<[string, string]>>([]);
  const [message, setMessage] = useState("");

  return (
    <div className="border rounded-md shadow-md min-h-full p-2 flex flex-col">
      <div className="flex-1 flex justify-center">Lobby Chat</div>
      <div className=" space-y-2">
        {history.map((m, i) => (
          <div key={m[1] + i}>
            <p className="text-sm">
            {m[0]}: {m[1]}

            </p>
          </div>
        ))}
      </div>

      <div>
        <input
          className="w-full border rounded-sm  p-1  pl-2 text-sm"
          placeholder="Enter a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setHistory([...history, ["You", message]]);
              setMessage("");

              socket?.emit("chat", message);
            }
          }}
        />
      </div>
    </div>
  );
}
