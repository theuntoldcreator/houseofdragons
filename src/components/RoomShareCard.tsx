
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface RoomShareCardProps {
    listing: {
        id: number;
        title: string;
        description: string;
        category: string;
        city: string;
        county?: string;
        contact_email: string;
        created_at: string;
        views?: number;
    };
}

export default function RoomShareCard({ listing }: RoomShareCardProps) {
    const formattedDate = new Date(listing.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
    });

    return (
        <Link to={`/listings/${listing.id}`} className="block group">
            <div className="flex items-center px-4 py-3 hover:bg-zinc-50 border-b border-zinc-100 transition-colors">
                {/* Column 1: Title & Category */}
                <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-0.5 mt-0.5 whitespace-normal">
                        <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${listing.category === 'Have'
                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                            : 'bg-orange-50 text-orange-600 border-orange-100'
                            }`}>
                            {listing.category}
                        </span>
                        <h3 className="font-bold text-[13px] text-[#101010] group-hover:text-blue-600 transition-colors leading-snug">
                            {listing.title}
                        </h3>
                    </div>
                </div>

                {/* Column 2: Area */}
                <div className="w-[100px] sm:w-[140px] hidden xs:block">
                    <p className="text-[12px] font-medium text-zinc-500 truncate pr-2">
                        {listing.county || listing.city}
                    </p>
                </div>

                {/* Column 3: Views */}
                <div className="w-[50px] sm:w-[70px] text-right">
                    <p className="text-[12px] font-bold text-zinc-400 whitespace-nowrap">
                        {listing.views || 0} <span className="hidden sm:inline text-[10px] uppercase font-black opacity-50 ml-0.5">views</span>
                    </p>
                </div>

                {/* Column 4: Timestamp */}
                <div className="w-[60px] sm:w-[80px] text-right ml-4">
                    <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-tighter whitespace-nowrap">
                        {formattedDate}
                    </p>
                </div>

                {/* Actions Icon */}
                <div className="ml-3 sm:ml-4 text-zinc-200 group-hover:text-zinc-400 transition-colors flex-shrink-0">
                    <ChevronRight size={16} />
                </div>
            </div>
        </Link>
    );
}
