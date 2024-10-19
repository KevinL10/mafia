import { useContext, useEffect, useRef, useState } from "react";
import Chat from "../components/chat";
import { SocketContext } from "../SocketContext";
import { useNavigate } from "react-router-dom";
import { PlayerCard } from "../components/playerCard";

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

export default function Game() {
  const [round, setRound] = useState(1);
  const [time, setTime] = useState("night");
  const [detectiveGuess, setDetectiveGuess] = useState("");
  const [players, setPlayers] = useState<Array<Player>>([]);
  const [summary, setSummary] = useState("");
  const [history, setHistory] = useState<Array<[string, string]>>([]);
  const [audioUrl, setAudioUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;
    if(players.length === 0) return;

    console.log("players", players)
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
      socket.off("aiMessage", handleMessage); // Clean up the listener when the component unmounts or updates
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
      console.log('got audio')
      const blob = new Blob([chunk], { type: 'audio/wav' });
      console.log(blob)
      const url = URL.createObjectURL(blob);
      console.log(url)
      setAudioUrl(url)
    })

    // socket.on("aiMessage", (message: ChatMessage) => {
    //   console.log('got message', message.player, message.text)
    //   console.log('players', players, players[message.player])
    //   setHistory([...history, [players[message.player].name, message.text]])
    // })

    socket.emit("startNight", -1);
  }, []);


  useEffect(() => {
    // Play the audio automatically when the URL is available
    if (audioUrl && audioRef.current) {
        audioRef.current.play();
    }
}, [audioUrl]);
  return (
    <>
      <audio ref={audioRef} src={audioUrl} /> 
      <button onClick={() => navigate("/")}>- go back</button>
      <div className="mt-8">your role: Townsperson</div>

      <div className="font-semibold text-2xl ">
        Day {round}: {time} {time == "night" && "..."}
      </div>

      <div>{summary}</div>

      <Chat history={history} setHistory={setHistory} />
      <div className="mt-8"></div>

      <div className="grid  grid-cols-3">
        {players.map((player, i) => (
          <PlayerCard key={i} player={player} />
        ))}
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
                setTime("night")
                socket?.emit("startNight", parseInt(detectiveGuess));
                setDetectiveGuess("");
              }
            }}
            type="number"
          />
        </div>
      )}
    </>
  );
}
