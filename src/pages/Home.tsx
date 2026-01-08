
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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
  created_at: string;
  views?: number;
}

export default function Home() {
  const { selectedCity, selectedArea } = useOutletContext<{
    selectedCity: string | null,
    selectedArea: string
  }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCity) {
      fetchListings();
      checkConnection();
    }
  }, [selectedCity]);

  // Delta Polling every 3 minutes
  useEffect(() => {
    if (!selectedCity) return;

    const interval = setInterval(() => {
      pollNewListings();
    }, 180000); // 3 minutes

    return () => clearInterval(interval);
  }, [selectedCity, listings]);

  const pollNewListings = async () => {
    if (!selectedCity || listings.length === 0) return;

    const latestTimestamp = listings[0].created_at;

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('city', selectedCity)
        .gt('created_at', latestTimestamp)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        console.log(`Polled ${data.length} new listings`);
        setListings(prev => [...data, ...prev]);
      }
    } catch (err) {
      console.error('Error polling new listings:', err);
    }
  };

  const checkConnection = async () => {
    const { error } = await supabase.from('listings').select('id').limit(1);
    if (error) {
      console.error('Database Connection Error:', error);
    } else {
      console.log('Database Connection Verified: Table "listings" found.');
    }
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('city', selectedCity)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const [viewerCount, setViewerCount] = useState(Math.floor(Math.random() * (750 - 450 + 1) + 450));
  const [sessionStartTime] = useState(Date.now());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const updateCount = () => {
      setViewerCount(prev => {
        const minutesElapsed = (Date.now() - sessionStartTime) / 60000;
        const isLongSession = minutesElapsed >= 10;
        const isMegaSpikePossible = Math.random() > 0.98; // Very rare "Telegram Burst"

        let change = 0;
        const randomSign = Math.random() > 0.4 ? 1 : -1; // Slight bias towards growth

        if (isMegaSpikePossible) {
          // rare "Telegram Burst" spike as requested
          change = Math.floor(Math.random() * 200) + 800; // Increase by 800-1000
        } else if (isLongSession && Math.random() > 0.7) {
          // Standard traffic wave after 10 mins
          change = randomSign * (Math.floor(Math.random() * 5) + 12); // 12-16
        } else {
          // Organic micro-drift
          change = randomSign * (Math.floor(Math.random() * 2) + 2); // 2 or 3
        }

        const newValue = prev + change;

        // Realistic bounds based on user's 5k telegram community
        const MIN_VIEWERS = 400;
        const MAX_VIEWERS = 5500;

        if (newValue < MIN_VIEWERS) return prev + Math.abs(change);
        if (newValue > MAX_VIEWERS) return prev - Math.abs(change);
        return newValue;
      });

      // Slower updates: Randomize between 5 and 15 seconds as requested
      const nextDelay = Math.floor(Math.random() * 10000) + 5000;
      timeoutId = setTimeout(updateCount, nextDelay);
    };

    // Initial delay before activity starts
    timeoutId = setTimeout(updateCount, 8000);
    return () => clearTimeout(timeoutId);
  }, [sessionStartTime]);

  if (!selectedCity) return null;

  return (
    <div className="divide-y divide-zinc-100 page-enter">
      <div className="px-5 py-8 border-b border-zinc-50">
        <h1 className="text-[28px] font-black text-[#101010] leading-tight flex items-baseline gap-2">
          NRI Everything
          <span className="text-[14px] font-bold text-zinc-400 font-sans tracking-normal bg-zinc-50 px-2 py-0.5 rounded-md border border-zinc-100 uppercase">
            {selectedCity && `Around ${selectedCity}`}
          </span>
        </h1>
        <div className="flex flex-col mt-2">
          <p className="text-secondary text-[15px] font-medium italic">Latest accommodation posts around you</p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            <p className="text-zinc-400 text-[12px] font-bold tracking-tight">
              <span className="tabular-nums transition-all duration-500">{viewerCount.toLocaleString()}</span> PEOPLE VIEWING RIGHT NOW
            </p>
          </div>
        </div>
      </div>

      {/* Table Headers */}
      {!loading && listings.length > 0 && (
        <div className="flex items-center px-8 py-3 border-b border-zinc-50 bg-zinc-50/30">
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

      <div className="pb-4 mt-2">
        {loading ? (
          <div className="p-16 text-center text-zinc-400">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 bg-zinc-50 rounded-full mb-4 border border-zinc-100" />
              <p className="font-bold text-sm tracking-wide">FETCHING NEW POSTS</p>
            </div>
          </div>
        ) : (listings.filter(l => selectedArea === 'All Areas' || l.county === selectedArea)).length === 0 ? (
          <div className="p-16 text-center text-zinc-400">
            <p className="text-[17px] font-bold text-black mb-1">Silence is golden...</p>
            <p className="text-sm">Be the first to start a RoomShare in {selectedArea === 'All Areas' ? `Around ${selectedCity}` : selectedArea}</p>
          </div>
        ) : (
          listings
            .filter(l => selectedArea === 'All Areas' || l.county === selectedArea)
            .map((listing) => (
              <RoomShareCard key={listing.id} listing={listing} />
            ))
        )}
      </div>
    </div>
  );
}
