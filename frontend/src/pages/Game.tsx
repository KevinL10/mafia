import { useContext, useEffect, useState } from "react";
import Chat from "../components/chat";
import { SocketContext } from "../SocketContext";
import { useNavigate } from "react-router-dom";
import { PlayerCard } from "../components/playerCard";

export interface Player {
  name: string;
  alive: boolean;
}

export interface RoundData {
  round: number;
  // mafiaEliminated: null | Array<number>;
  // detectiveEliminated: null | number;
  // doctorSaved: null | number;
  summary: string;
  // aliveState: Array<boolean>;
  players: Array<Player>
}

export default function Game() {
  const [round, setRound] = useState(1);
  const [time, setTime] = useState("night");
  const [detectiveGuess, setDetectiveGuess] = useState("");
  const [players, setPlayers] = useState<Array<Player>>([])
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
      setSummary(data.summary);
      setPlayers(data.players)
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

      <div>{summary}</div>

      <Chat />
      <div className="mt-8"></div>

      <div className="grid  grid-cols-3">
        {players.map((player, i) => (
          <PlayerCard key={i} player={player}/>
        ))}
      </div>
      {time === "day" && <button
        onClick={(e) => {
          // socket?.emit("start_night", );
          setTime("night");
        }}
      >
        start nighttime
      </button> }

      {time === "night" && round !== 1 && (
        <div>
          enter your guess for mafia
          <input
          className="border"
            value={detectiveGuess}
            onChange={(e) => setDetectiveGuess(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                socket?.emit("start_night", parseInt(detectiveGuess));
                setDetectiveGuess("")
              }
            }}
            type="number"
          />
        </div>
      )}
    </>
  );
}
