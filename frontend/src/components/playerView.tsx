import { Player } from "../pages/Game";

export function PlayerCard({ player }: { player: Player }) {
  let inner;
  if (player.alive) {
    inner = <div className="bg-green-500">alive</div>;
  } else {
    inner = <div className=" bg-red-500">dead</div>;
  }
  return (
    <div className="border rounded-md w-56 h-44 gap-2">
      <div>{player.name}</div>
      {inner}
      <div>{player.role}</div>
    </div>
  );
}

export function PlayerView({ players }: { players: Array<Player> }) {
  return (
    <div className=" justify-center flex-1 grid grid-cols-3 gap-4">
      {players.map((player, i) => (
        <PlayerCard key={i} player={player} />
      ))}
    </div>
  );
}
