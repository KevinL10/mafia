import { Player } from "../pages/Game";

const image_urls = [
  "kevin.png", // "Kevin",
  "olivia.png",
  "liam.png",
  "hiroshi.png",
  "sophia.png",
  "zainab.png",
  "ethan.png",
]
export function PlayerCard({ 
  player, 
  url, 
  isSelected, 
  onSelect, 
  isSelectable 
}: { 
  player: Player; 
  url: string; 
  isSelected: boolean; 
  onSelect: () => void; 
  isSelectable: boolean;
}) {
  let borderColor = player.alive ? "border-green-500" : "border-red-500";
  if (isSelected) {
    borderColor = "border-blue-500";
  }
  
  return (
    <div 
      className={`relative bg-contain bg-no-repeat border-4 rounded-md w-44 h-44 gap-2 ${borderColor} ${isSelectable ? 'cursor-pointer' : ''}`} 
      style={{backgroundImage: `url('/${url}')`}}
      onClick={isSelectable ? onSelect : undefined}
    >
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
        <div className="font-bold text-white text-lg text-center drop-shadow-md">
          {player.name}
        </div>
        {player.role && (
          <div className="text-white text-sm text-center drop-shadow-md">
            {player.role}
          </div>
        )}
      </div>
    </div>
  );
}

export function PlayerView({ 
  players, 
  onPlayerSelect, 
  selectedPlayer, 
  isSelectable 
}: { 
  players: Array<Player>; 
  onPlayerSelect: (index: number) => void; 
  selectedPlayer: number | null;
  isSelectable: boolean;
}) {
  return (
    <div className="justify-center flex-1 grid grid-cols-3 gap-4">
      {players.map((player, i) => (
        <PlayerCard 
          key={i} 
          player={player} 
          url={image_urls[i]} 
          isSelected={selectedPlayer === i}
          onSelect={() => onPlayerSelect(i)}
          isSelectable={isSelectable}
        />
      ))}
    </div>
  );
}
