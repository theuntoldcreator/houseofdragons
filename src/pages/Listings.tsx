
import { useState, useEffect, useTransition } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search as SearchIcon } from 'lucide-react';
import RoomShareCard from '../components/RoomShareCard';

interface Listing {
  id: number;
  title: string;
  description: string;
  category: string;
  city: string;
  county?: string;
  contact_name: string;
  contact_email: string;
  telegram_username?: string;
  contact_info?: string;
  preferred_contact?: string;
  created_at: string;
  views?: number;
}

export default function Listings() {
  const { selectedCity, selectedArea } = useOutletContext<{
    selectedCity: string | null,
    selectedArea: string
  }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isPending, startTransition] = useTransition();
  const [newListingIds, setNewListingIds] = useState<Set<number>>(new Set());

  // Simple debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setDebouncedSearch(searchTerm);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchListings();
  }, []);

  // Delta Polling every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      pollNewListings();
    }, 1000); // 1 second as requested

    return () => clearInterval(interval);
  }, [listings]);

  const pollNewListings = async () => {
    if (listings.length === 0) return;

    const latestTimestamp = listings[0].created_at;

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .gt('created_at', latestTimestamp)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        console.log(`Polled ${data.length} new listings`);

        // Track new IDs for animation
        const newIds = new Set(data.map((l: Listing) => l.id));
        setNewListingIds(prev => new Set([...Array.from(prev), ...Array.from(newIds)]));

        setListings(prev => [...data, ...prev]);

        // Remove animation class after some time
        setTimeout(() => {
          setNewListingIds(prev => {
            const next = new Set(prev);
            newIds.forEach(id => next.delete(id));
            return next;
          });
        }, 2000);
      }
    } catch (err) {
      console.error('Error polling new listings:', err);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setListings(data);
    }
    setLoading(false);
  };

  // Realtime Subscription (as fallback/double-check)
  useEffect(() => {
    const channel = supabase
      .channel('listings-search-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'listings'
        },
        (payload) => {
          const newListing = payload.new as Listing;
          // Check if we already have it from polling
          setListings(prev => {
            if (prev.some(l => l.id === newListing.id)) return prev;

            setNewListingIds(ids => new Set([...Array.from(ids), newListing.id]));
            setTimeout(() => {
              setNewListingIds(ids => {
                const next = new Set(ids);
                next.delete(newListing.id);
                return next;
              });
            }, 2000);
            return [newListing, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const categories = ['All', 'Have', 'Need'];

  const filteredListings = listings.filter(l => {
    // 1. City Filter (Client Side)
    const matchesCity = !selectedCity || selectedCity === 'All Cities' || l.city === selectedCity;
    if (!matchesCity) return false;

    // 2. Search Filter
    const term = debouncedSearch.toLowerCase();
    const matchesSearch = l.title.toLowerCase().includes(term) ||
      l.description.toLowerCase().includes(term) ||
      (l.county && l.county.toLowerCase().includes(term));

    // 3. Category Filter
    const matchesCategory = selectedCategory === 'All' || l.category === selectedCategory;

    // 4. Area Filter
    const matchesArea = selectedArea === 'All Areas' || l.county === selectedArea;

    return matchesSearch && matchesCategory && matchesArea;
  });

  return (
    <div className="bg-white min-h-screen">
      <div className="px-4 py-6 sticky top-[60px] bg-white/80 backdrop-blur-xl z-20 transition-all border-b border-gray-100">
        <h1 className="text-2xl font-bold text-[#101010] mb-4">Search</h1>

        <div className={`relative mb-5 transition-transform ${isPending ? 'scale-[0.99] opacity-80' : 'scale-100 opacity-100'}`}>
          <SearchIcon className={`absolute left-5 top-1/2 transform -translate-y-1/2 transition-colors ${isPending ? 'text-black' : 'text-zinc-400'}`} size={20} />
          <input
            type="text"
            placeholder={`Search areas in ${selectedCity && `Around ${selectedCity}`}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="roomshare-input !pl-14 py-4 bg-zinc-100 border-none rounded-2xl font-medium"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat
                ? 'bg-black text-white shadow-sm'
                : 'bg-transparent text-zinc-400 hover:text-black border border-zinc-200'
                }`}
            >
              {cat === 'All' ? 'For you' : cat === 'Have' ? 'Available' : 'Needed'}
            </button>
          ))}
        </div>
      </div>

      {/* Table Headers */}
      {!loading && filteredListings.length > 0 && (
        <div className="flex items-center px-8 py-3 border-b border-zinc-50 bg-zinc-50/10">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Post</span>
          </div>
          <div className="w-[120px] hidden sm:block">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Area</span>
          </div>
          <div className="w-[60px] text-right">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Views</span>
          </div>
          <div className="w-[80px] text-right ml-4">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date</span>
          </div>
          <div className="w-[16px] ml-4" />
        </div>
      )}

      <div className={`divide-y-0 py-2 space-y-0 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        {loading ? (
          <div className="p-12 text-center text-secondary animate-pulse">Fetching posts...</div>
        ) : filteredListings.length === 0 ? (
          <div className="p-12 text-center text-secondary">
            <p className="font-bold text-black">No results found</p>
            <p className="text-sm">Try searching for "{searchTerm}" in another city</p>
          </div>
        ) : (
          filteredListings.map(listing => (
            <RoomShareCard
              key={listing.id}
              listing={listing}
              isNew={newListingIds.has(listing.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
