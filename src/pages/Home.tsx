
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
  contact_email: string;
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

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 7) - 3;
        const newValue = prev + change;
        return newValue > 400 ? newValue : 400;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
          <div className="flex items-center gap-1.5 mt-2 transition-all duration-1000">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            <p className="text-zinc-400 text-[12px] font-bold tracking-tight">
              <span className="tabular-nums">{viewerCount.toLocaleString()}</span> PEOPLE VIEWING RIGHT NOW
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
