export function PlayerCard({ alive }: { alive: boolean }) {
  let inner;
  if (alive) {
    inner = <div className="bg-green-500">alive</div>;
  } else {
    inner = <div className=" bg-red-500">dead</div>;
  }
  return <div className="border w-10 h-20">{inner}</div>;
}
