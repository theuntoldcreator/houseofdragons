
import { useState, useMemo } from 'react';
import { Search, MapPin, ChevronRight } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: string) => void;
}

const LOCATIONS = [
  { city: 'Dallas', areas: ['Irving', 'Richardson', 'Plano', 'Arlington', 'Garland', 'Frisco'] },
  { city: 'Austin', areas: ['Round Rock', 'Cedar Park', 'Pflugerville', 'Georgetown', 'San Marcos'] },
  { city: 'Houston', areas: ['Sugar Land', 'The Woodlands', 'Katy', 'Pearland', 'Cypress'] }
];

export default function LocationModal({ isOpen, onClose, onSelect }: LocationModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelect = (city: string) => {
    localStorage.setItem('selected_city', city);
    onSelect(city);
    onClose();
    window.dispatchEvent(new Event('locationChanged'));
  };

  const filteredLocations = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return LOCATIONS;

    return LOCATIONS.map(loc => {
      const cityMatches = loc.city.toLowerCase().includes(term);
      const matchingAreas = loc.areas.filter(area => area.toLowerCase().includes(term));

      if (cityMatches || matchingAreas.length > 0) {
        return { ...loc, areas: matchingAreas, cityMatches };
      }
      return null;
    }).filter(Boolean) as any[];
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-[32px] shadow-2xl border border-zinc-100 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-8 pb-4">
          <h2 className="text-3xl font-black text-[#101010] mb-2 tracking-tight">Where are you?</h2>
          <p className="text-secondary text-base mb-6 font-medium">Select a city to find accommodations</p>

          <div className="relative mb-6">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 focus-within:text-black transition-colors" size={20} />
            <input
              type="text"
              autoFocus
              placeholder="Search city or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="roomshare-input !pl-14 py-4.5 bg-zinc-50 border border-zinc-100/50 rounded-2xl placeholder:text-zinc-400 font-medium w-full outline-none"
            />
          </div>
        </div>

        <div className="overflow-y-auto px-4 pb-8 hide-scrollbar">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleSelect('All Cities')}
              className="flex items-center justify-between w-full p-4 rounded-2xl hover:bg-zinc-50 transition-all group border border-transparent hover:border-zinc-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-black/10">
                  <MapPin className="text-white" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg text-[#101010]">All Cities</p>
                  <p className="text-xs text-secondary font-medium">View every listing everywhere</p>
                </div>
              </div>
              <ChevronRight className="text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
            </button>

            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => (
                <div key={loc.city} className="contents">
                  <button
                    onClick={() => handleSelect(loc.city)}
                    className="flex items-center justify-between w-full p-4 rounded-2xl hover:bg-zinc-50 transition-all group border border-transparent hover:border-zinc-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-50 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">
                        <MapPin className="text-black fill-black/5" size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg text-[#101010]">Around {loc.city}</p>
                        <p className="text-xs text-secondary font-medium">View all posts</p>
                      </div>
                    </div>
                    <ChevronRight className="text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                  </button>

                  {searchTerm && loc.areas.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-4 pb-4">
                      {loc.areas.map((area: string) => (
                        <button
                          key={area}
                          onClick={() => handleSelect(loc.city)}
                          className="px-3 py-1.5 bg-zinc-100 hover:bg-black hover:text-white rounded-full text-xs font-bold text-zinc-600 transition-colors"
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-secondary">
                <p className="font-bold text-black">No locations found</p>
                <p className="text-sm">Try searching for a major city</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
