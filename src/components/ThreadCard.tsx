
import { MapPin, Mail, MessageCircle, MoreHorizontal } from 'lucide-react';

interface ThreadCardProps {
    listing: {
        id: number;
        title: string;
        description: string;
        category: string;
        city: string;
        county?: string;
        contact_email: string;
        created_at: string;
    };
}

export default function ThreadCard({ listing }: ThreadCardProps) {
    return (
        <div className="threads-card group cursor-pointer">
            <div className="flex gap-3">
                {/* Profile Mock (Threads style circles) */}
                <div className="flex flex-col items-center pt-1">
                    <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {/* Simple Initial for profile look */}
                        <span className="text-zinc-400 font-bold text-xs uppercase">{listing.category[0]}</span>
                    </div>
                    <div className="w-0.5 grow bg-zinc-100 mt-2 mb-1 group-last:hidden" />
                </div>

                <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[14px] leading-tight hover:underline">
                                {listing.category === 'Have' ? 'Available Room' : 'Looking for Room'}
                            </span>
                            <span className="text-zinc-400 text-xs">•</span>
                            <span className="text-zinc-400 text-[12px]">
                                {new Date(listing.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                        <button className="text-zinc-300 hover:text-black transition-colors rounded-full p-1">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>

                    <h3 className="font-bold text-[15px] mb-1 text-[#101010] leading-snug">{listing.title}</h3>
                    <p className="text-[14px] text-[#101010]/80 mb-3 whitespace-pre-wrap leading-[1.4] tracking-tight">
                        {listing.description}
                    </p>

                    <div className="flex items-center gap-5 text-zinc-400">
                        <div className="flex items-center gap-1.5 hover:text-black transition-colors">
                            <MessageCircle size={18} />
                            <span className="text-[13px] font-medium">1.2k</span>
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-black transition-colors">
                            <MapPin size={17} />
                            <span className="text-[13px] font-medium">{listing.city}{listing.county ? `, ${listing.county}` : ''}</span>
                        </div>
                        <a
                            href={`mailto:${listing.contact_email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 hover:text-black transition-colors"
                        >
                            <Mail size={17} />
                            <span className="text-[13px] font-medium">Contact</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
