import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
interface HeaderProps {
    selectedArea: string;
    availableAreas: string[];
    onAreaChange: (area: string) => void;
}

export default function Header({ selectedArea, availableAreas, onAreaChange }: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 w-full h-[64px] bg-white/90 backdrop-blur-xl border-b border-zinc-100 z-50 flex items-center justify-between px-5">
            <div className="flex items-center gap-3">
                <Link to="/" className="flex items-center gap-2 group">
                    <img src="/logo.jpg" alt="NRI Everything Logo" className="w-10 h-10 rounded-full object-cover border-2 border-[#ff6b00] group-hover:scale-105 transition-transform" />
                    <div className="bg-[#ff6b00] text-white font-black px-2 py-1.5 rounded-[8px] text-[12px] leading-tight uppercase tracking-tight group-hover:opacity-90 transition-opacity">
                        NRI<br />Everything
                    </div>
                </Link>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative inline-block">
                    <select
                        value={selectedArea}
                        onChange={(e) => onAreaChange(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-2 rounded-xl text-[13px] font-bold bg-zinc-50 border border-zinc-100 text-zinc-800 hover:border-zinc-300 transition-all outline-none shadow-sm min-w-[140px]"
                    >
                        <option value="All Areas">All Areas</option>
                        {availableAreas.map((area) => (
                            <option key={area} value={area}>{area}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
            </div>
        </header>
    );
}
