import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, Info, MapPin } from 'lucide-react';

interface BottomNavProps {
    selectedCity: string | null;
    onLocationClick: () => void;
}

export default function BottomNav({ selectedCity, onLocationClick }: BottomNavProps) {
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Search', path: '/listings' },
        { icon: PlusSquare, label: 'Post', path: '/post' },
        { icon: MapPin, label: selectedCity || 'City', isLocation: true },
        { icon: Info, label: 'Contact', path: '/contact' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-zinc-100 flex items-center justify-around h-[72px] px-2 z-50 lg:hidden safe-area-bottom">
            {navItems.map((item) => {
                const isActive = !item.isLocation && location.pathname === item.path;

                const content = (
                    <div className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${isActive || item.isLocation ? 'text-black' : 'text-zinc-400'
                        }`}>
                        <item.icon
                            size={20}
                            strokeWidth={isActive || item.isLocation ? 2.5 : 2}
                            className={isActive ? 'scale-110' : 'scale-100'}
                        />
                        <span className={`text-[9px] font-black uppercase tracking-widest truncate max-w-[60px] ${isActive || item.isLocation ? 'opacity-100' : 'opacity-60'
                            }`}>
                            {item.label}
                        </span>
                    </div>
                );

                if (item.isLocation) {
                    return (
                        <button
                            key="location"
                            onClick={onLocationClick}
                            className="flex-1 h-full"
                        >
                            {content}
                        </button>
                    );
                }

                return (
                    <Link
                        key={item.label}
                        to={item.path!}
                        className="flex-1 h-full"
                    >
                        {content}
                    </Link>
                );
            })}
        </nav>
    );
}
