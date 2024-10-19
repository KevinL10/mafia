import { useContext, useEffect, useState } from "react";
import Chat from "../components/chat";
import { SocketContext } from "../SocketContext";
import { useNavigate } from "react-router-dom";
import { PlayerCard } from "../components/playerCard";

export interface RoundData {
  round: number;
  // mafiaEliminated: null | Array<number>;
  // detectiveEliminated: null | number;
  // doctorSaved: null | number;
  summary: string;
  aliveState: Array<boolean>;
}

export default function Game() {
  const [round, setRound] = useState(1);
  const [time, setTime] = useState("night");
  const [aliveState, setAliveState] = useState<Array<boolean>>(
    new Array(7).fill(true)
  );
  const [summary, setSummary] = useState("");

  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    console.log("use effect");
    socket.on("newRound", (data: RoundData) => {
      // console.log(data.mafiaEliminated);
      // console.log(data.detectiveEliminated);
      // console.log(data.doctorSaved);
      // console.log(data.aliveState);
      setSummary(data.summary)
      setAliveState(data.aliveState)
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

      <div>
        {summary}
      </div>
      
      <Chat />
      <div className="mt-8"></div>

      <div className="grid  grid-cols-3">
        {aliveState.map((isAlive, i) => (
          <PlayerCard key={i} alive={isAlive} />
        ))}
      </div>
      <button
        onClick={(e) => {
          socket?.emit("continue");
          setTime("night");
        }}
      >
        continue
      </button>
    </>
  );
}
