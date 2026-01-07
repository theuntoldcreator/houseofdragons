
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Search, PlusCircle, Mail } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Home', path: '/', icon: <Home size={18} /> },
        { name: 'Listings', path: '/listings', icon: <Search size={18} /> },
        { name: 'Post Ad', path: '/post', icon: <PlusCircle size={18} /> },
        { name: 'Contact', path: '/contact', icon: <Mail size={18} /> },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="container">
                <div className="flex justify-between items-center">
                    <Link to="/" className="nav-brand">
                        House of Dragons
                    </Link>

                    {/* Desktop Menu */}
                    <div className="nav-menu">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="nav-toggle"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="mobile-menu">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`mobile-link ${isActive(link.path) ? 'active' : ''}`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}
