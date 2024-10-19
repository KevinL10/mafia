import { Player } from "../pages/Game";

export function PlayerCard({ player }: { player: Player }) {
  let inner;
  if (player.alive) {
    inner = <div className="bg-green-500">alive</div>;
  } else {
    inner = <div className=" bg-red-500">dead</div>;
  }
  return (
    <div className="border w-10 h-20">
      <div>{player.name}</div>
      {inner}
      <div>{player.role}</div>
    </div>
  );
}
