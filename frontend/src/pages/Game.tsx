import { useContext, useEffect, useState } from "react";
import Chat from "../components/chat";
import { SocketContext } from "../SocketContext";
import { useNavigate } from "react-router-dom";

export interface RoundData {
  round: number;
  mafiaEliminated: null | Array<number>;
  detectiveEliminated: null | number;
  doctorSaved: null | number;
}

export default function Game() {
  const [round, setRound] = useState(1);
  const [time, setTime] = useState("night");
  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    console.log("use effect");
    socket.on("newRound", (data: RoundData) => {
      console.log(data.mafiaEliminated);
      console.log(data.detectiveEliminated);
      console.log(data.doctorSaved);
      setRound(data.round);
      setTime("day");
    });

    socket.emit("startGame", "");
  }, []);
  return (
    <>
      <button onClick={() => navigate("/")}>- go back</button>
      <div className="mt-8">your role: Townsperson</div>

      <div className="font-semibold text-2xl ">
        Day {round}: {time} {time == "night" && "..."}
      </div>

      <div className="mt-8">
        <Chat />

        <button
          onClick={(e) => {
            socket?.emit("continue");
            setTime("night");
          }}
        >
          continue
        </button>
      </div>
    </>
  );
}
