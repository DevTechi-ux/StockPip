import { List, ChartCandlestick, Briefcase, History, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MobileNav({ onWatchlist, onTicket, onPositions, onHistory, onMore }: { onWatchlist?: () => void; onTicket: () => void; onPositions?: () => void; onHistory?: () => void; onMore: () => void; }) {
  const navigate = useNavigate();
  
  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWatchlist) {
      onWatchlist();
    } else {
      navigate('/watchlist', { replace: false });
    }
  };

  const handlePositions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPositions) {
      onPositions();
    } else {
      navigate('/positions', { replace: false });
    }
  };

  const handleHistory = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onHistory) {
      onHistory();
    } else {
      navigate('/history', { replace: false });
    }
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-center justify-between border-t bg-background px-4 md:hidden safe-area-bottom">
      <button 
        type="button"
        className="flex flex-col items-center text-xs" 
        onClick={handleWatchlist}
      >
        <List className="h-5 w-5" />
        <span>Watchlist</span>
      </button>
      <button 
        type="button"
        className="flex flex-col items-center text-xs" 
        onClick={onTicket}
      >
        <ChartCandlestick className="h-5 w-5" />
        <span>Ticket</span>
      </button>
      <button 
        type="button"
        className="flex flex-col items-center text-xs" 
        onClick={handlePositions}
      >
        <Briefcase className="h-5 w-5" />
        <span>Positions</span>
      </button>
      <button 
        type="button"
        className="flex flex-col items-center text-xs" 
        onClick={handleHistory}
      >
        <History className="h-5 w-5" />
        <span>History</span>
      </button>
      <button 
        type="button"
        className="flex flex-col items-center text-xs" 
        onClick={onMore}
      >
        <MoreHorizontal className="h-5 w-5" />
        <span>More</span>
      </button>
    </nav>
  );
}
