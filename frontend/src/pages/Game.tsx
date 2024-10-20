import { useContext, useEffect, useRef, useState } from "react";
import Chat from "../components/chat";
import { SocketContext } from "../SocketContext";
import { useNavigate } from "react-router-dom";
import { PlayerCard } from "../components/playerCard";
import { PlayerView } from "../components/playerView";

export interface Player {
  name: string;
  alive: boolean;
  role?: string;
}

export interface ChatMessage {
  player: number;
  text: string;
}

export interface RoundData {
  round: number;
  // mafiaEliminated: null | Array<number>;
  // detectiveEliminated: null | number;
  // doctorSaved: null | number;
  summary: string;
  // aliveState: Array<boolean>;
  players: Array<Player>;
}

const NAMES = [
  "Kevin",
  "Olivia",
  "Liam",
  "Hiroshi",
  "Sophia",
  "Zainab",
  "Ethan",
];
export default function Game() {
  const [round, setRound] = useState(1);
  const [time, setTime] = useState("night");
  const [detectiveGuess, setDetectiveGuess] = useState("");
  const [players, setPlayers] = useState<Array<Player>>(
    [...Array(7)].map((_, i) => {
      return { name: NAMES[i], alive: true };
    })
  );
  const [summary, setSummary] = useState("");
  const [history, setHistory] = useState<Array<[string, string]>>([]);
  const [audioUrl, setAudioUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;
    if (players.length === 0) return;

    console.log("players", players);
    const handleMessage = (message: ChatMessage) => {
      console.log("got message", message.player, message.text);
      console.log("players", players, players[message.player]);

      setHistory((prevHistory) => [
        ...prevHistory,
        [players[message.player].name, message.text],
      ]);
    };

    socket.on("aiMessage", handleMessage);

    return () => {
      socket.off("aiMessage", handleMessage);
    };
  }, [players]);

  useEffect(() => {
    if (!socket) return;

    console.log("use effect");
    socket.on("newRound", (data: RoundData) => {
      console.log("got new round ");
      setSummary(data.summary);
      setPlayers((players) => data.players);
      setRound(data.round);
      setTime("day");
      // socket.emit("startDay")
    });

    socket.on("audio", (chunk) => {
      console.log("got audio");
      const blob = new Blob([chunk], { type: "audio/wav" });
      console.log(blob);
      const url = URL.createObjectURL(blob);
      console.log(url);
      setAudioUrl(url);
    });

    socket.emit("start");
    socket.emit("startNight", -1);
  }, []);

  useEffect(() => {
    // Play the audio automatically when the URL is available
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
    }
  }, [audioUrl]);
  return (
    <div className="p-8 h-screen">
      <audio ref={audioRef} src={audioUrl} />
      {/* <button onClick={() => navigate("/")}>- go back</button> */}

      <div className="flex justify-center">
        <div className="font-semibold text-2xl ">
          Day {round}: {time} {time == "night" && "..."}
        </div>
      </div>

      <div className="flex flex-row gap-4 min-h-full mt-8">
        <div className="flex-1">
          <Chat history={history} setHistory={setHistory} />
        </div>

        <div className="flex-[2]">
          <PlayerView players={players} />
        </div>
        <div className="flex-1">{summary}</div>
      </div>

      {time === "day" && (
        <button
          onClick={(e) => {
            // socket?.emit("start_night", );
            setTime("night-decision");
          }}
        >
          start nighttime
        </button>
      )}

      {time === "night-decision" && round !== 1 && (
        <div>
          enter your guess for mafia
          <input
            className="border"
            value={detectiveGuess}
            onChange={(e) => setDetectiveGuess(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setTime("night");
                socket?.emit("startNight", parseInt(detectiveGuess));
                setDetectiveGuess("");
              }
            }}
            type="number"
          />
        </div>
      )}
    </div>
  );
}
