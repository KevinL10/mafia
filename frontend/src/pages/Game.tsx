import { useContext, useEffect, useRef, useState } from "react";
import Chat from "../components/chat";
import { SocketContext } from "../SocketContext";
import { useNavigate } from "react-router-dom";
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
  gameWon: boolean;
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
  const [history, setHistory] = useState<Array<[string, number, string]>>([]);
  const [audioUrl, setAudioUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  const handlePlayerSelect = (index: number) => {
    if (isInvestigating) {
      setSelectedPlayer((prevSelected) =>
        prevSelected === index ? null : index
      );
      // if (players[index].role === "mafia") {
      //   setGameWon(true);
      // }
    }
  };

  useEffect(() => {
    if (!socket) return;
    if (players.length === 0) return;

    console.log("players", players);
    const handleMessage = (message: ChatMessage) => {
      console.log("got message", message.player, message.text);
      console.log("players", players, players[message.player]);

      setHistory((prevHistory) => [
        ...prevHistory,
        [players[message.player].name, message.player, message.text],
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
      setTime("daytime");
      setIsLoading(false);
      setGameWon(data.gameWon);
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

  const resetGame = () => {
    setRound(1);
    setTime("night");
    setDetectiveGuess("");
    setPlayers([...Array(7)].map((_, i) => ({ name: NAMES[i], alive: true })));
    setSummary("");
    setHistory([]);
    setAudioUrl("");
    setSelectedPlayer(null);
    setIsInvestigating(false);
    setIsLoading(true);
    setGameWon(false);
  };

  if (!gameStarted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <button onClick={() => setGameStarted(true)} className="rpgui-button">
          <p className="text-white">Start Game</p>
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 h-screen">
      <audio ref={audioRef} src={audioUrl} />

      <div className="relative">
        <div className="text-center font-semibold text-2xl">
          <div className="flex justify-center items-center">
            Day {round}: {time == "night"? "Nighttime": time == "daytime"? "Day": time}
            {time === "night" && isLoading && (
              <div className="ml-2 animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            )}
          </div>
        </div>
        {time === "daytime" && !isInvestigating && (
          <div className="absolute -top-4 right-8">
            <button
              onClick={() => {
                setIsInvestigating(true);
              }}
              className="rpgui-button"
            >
              <p className="text-white">Investigate Player</p>
            </button>
          </div>
        )}
        {isInvestigating && (
          <div className="absolute -top-4 right-8">
            <button
              onClick={() => {
                if (selectedPlayer !== null) {
                  setTime("night");
                  setIsLoading(true);
                  socket?.emit("startNight", selectedPlayer);
                  setSelectedPlayer(null);
                  setIsInvestigating(false);
                } else {
                  alert("Please select a player to investigate.");
                }
              }}
              className="rpgui-button"
            >
              <p className="text-white">Confirm Investigation</p>
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-row gap-4 min-h-full mt-8">
        <div className="flex-1 min-h-[50%]">
          <Chat history={history} setHistory={setHistory} />
        </div>

        <div className="flex-[2]">
          <PlayerView
            players={players}
            onPlayerSelect={handlePlayerSelect}
            selectedPlayer={selectedPlayer}
            isSelectable={isInvestigating}
          />
        </div>
        <div className="flex-1 min-h-[50%]">
          <div className="text-white rpgui-container framed min-h-[80%] max-h-[80%] p-2 mr-8">
            <div className="flex justify-center">Announcements</div>
              
              <div className="text-sm mt-2">
              {summary}

              </div>
            <div className="mt-2  invisible">
              <input
                className="rpgui-input px-2 py-1 rounded-md"
                placeholder="Enter a message... ........."
              />
            </div>
          </div>
        </div>
      </div>
      {gameWon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rpgui-container framed text-white">
            <h2 className="text-3xl font-bold mb-4">Congratulations!</h2>
            <p className="text-xl mb-4">
              You've successfully identified the Mafia and won the game!
            </p>
            <button
              onClick={() => {
                resetGame();
                socket?.emit("start");
                socket?.emit("startNight", -1);
              }}
              className="rpgui-button"
            >
              <p>Play Again</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
