
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, MapPin, Info } from 'lucide-react';

interface SidebarProps {
    selectedCity: string | null;
    onLocationClick: () => void;
}

export default function Sidebar({ selectedCity, onLocationClick }: SidebarProps) {
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Search', path: '/listings' },
        { icon: PlusSquare, label: 'Post', path: '/post' },
        { icon: Info, label: 'Contact', path: '/contact' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-full w-[240px] bg-white border-r border-zinc-100 hidden lg:flex flex-col p-6 z-40">
            <div className="mb-10">
                <Link to="/" className="text-[24px] font-black tracking-tight text-[#101010] hover:opacity-80 transition-opacity">
                    RoomShare
                </Link>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-bold text-[14px] ${isActive
                                ? 'bg-black text-white shadow-sm'
                                : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'
                                }`}
                        >
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto space-y-4 pt-6 border-t border-zinc-50">
                {/* Location Link */}
                <button
                    onClick={onLocationClick}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-50 border border-zinc-100 text-black hover:bg-zinc-100 transition-all text-left group"
                >
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <MapPin size={16} className="text-black" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1">Your Location</p>
                        <p className="text-[13px] font-bold truncate">Around {selectedCity || 'None'}</p>
                    </div>
                </button>

                <div className="flex items-center gap-3 px-3 text-zinc-400">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-zinc-100" />
                        ))}
                    </div>
                    <span className="text-[11px] font-bold italic">7.2k Active</span>
                </div>
            </div>
        </aside>
    );
}
