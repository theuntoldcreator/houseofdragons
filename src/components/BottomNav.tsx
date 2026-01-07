
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, Mail, User } from 'lucide-react';

export default function BottomNav() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Search', path: '/listings' },
        { icon: PlusSquare, label: 'Post', path: '/post' },
        { icon: Mail, label: 'Inbox', path: '/contact' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 w-full h-[64px] bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50 flex justify-around items-center px-2">
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className="flex flex-col items-center justify-center grow h-full relative"
                >
                    <item.icon
                        size={24}
                        strokeWidth={isActive(item.path) ? 2.5 : 1.5}
                        className={`transition-all duration-200 ${isActive(item.path) ? 'text-black scale-110' : 'text-zinc-400 hover:text-black'}`}
                    />
                    <span className={`text-[10px] mt-1 font-medium transition-colors ${isActive(item.path) ? 'text-black' : 'text-zinc-400'}`}>
                        {item.label}
                    </span>
                    {isActive(item.path) && (
                        <div className="absolute bottom-0 w-1 h-1 bg-black rounded-full" />
                    )}
                </Link>
            ))}
        </nav>
    );
}
