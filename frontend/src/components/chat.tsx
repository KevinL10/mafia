import { useContext, useState } from "react";
import { SocketContext } from "../SocketContext";

const COLORS = ["green", "red", "yellow", "blue", "purple", "gray", "orange"]

export default function Chat({
  history,
  setHistory,
}: {
  history: Array<[string, number, string]>;
  setHistory: (value: Array<[string, number, string]>) => void;
}) {
  const socket = useContext(SocketContext);
  // const [history, setHistory] = useState<Array<[string, string]>>([]);
  const [message, setMessage] = useState("");

  return (  
    <div className="rpgui-container framed min-h-[80%] max-h-[80%] p-2 flex flex-col overflow-hidden max-w-80">
      <div className="flex-1 flex justify-center text-white">Lobby Chat</div>
      <div className="space-y-1 overflow-y-auto">
        {history.map((m, i) => {
          const nameColor = COLORS[m[1]];
          console.log(m)
          return (
            <div key={m[2] + i} className="break-words">
              <p className="text-sm text-white">
                <span className={`text-${nameColor}-300 font-bold`}>{m[0]}</span>: {m[2]}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-2">
        <input
          className="rpgui-input px-2 py-1 rounded-md w-full"
          placeholder="Enter a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setHistory([...history, ["You", 0, message]]);
              setMessage("");

              socket?.emit("chat", message);
            }
          }}
        />
      </div>
    </div>
  );
}
