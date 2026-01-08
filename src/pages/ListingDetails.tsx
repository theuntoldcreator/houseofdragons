
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Share2, Trash2, X, AlertCircle } from 'lucide-react';

interface Listing {
    id: number;
    title: string;
    category: string;
    city: string;
    county?: string;
    description: string;
    price?: string;
    created_at: string;
    contact_name: string;
    contact_email: string;
    telegram_username?: string;
    views?: number;
}

const DELETE_CODE = "9182470792";

import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import { CITY_COORDS } from '../lib/locations';

export default function ListingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteCodeInput, setDeleteCodeInput] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        if (id) fetchListing(id);
    }, [id]);

    const fetchListing = async (listingId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .eq('id', listingId)
            .single();

        if (!error && data) {
            setListing(data);

            // Increment views uniquely by IP
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const { ip } = await ipResponse.json();
                await supabase.rpc('increment_views', {
                    listing_id: listingId,
                    user_ip: ip
                });
            } catch (ipErr) {
                console.warn('Failed to track view by IP:', ipErr);
            }
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (deleteCodeInput !== DELETE_CODE) {
            setDeleteError("Invalid 10-digit security code.");
            return;
        }

        setIsDeleting(true);
        setDeleteError("");
        console.log('Attempting to delete listing ID:', listing?.id);

        try {
            const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', listing?.id);

            if (error) {
                console.error('Supabase Delete Error:', error);
                throw error;
            }

            console.log('Successfully deleted listing');
            alert("Listing deleted successfully.");
            navigate('/');
        } catch (err: any) {
            console.error('Delete Catch Error:', err);
            setDeleteError(err.message || "Failed to delete listing.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-zinc-50 rounded-full mb-4 border border-zinc-100" />
                <p className="font-bold text-sm text-zinc-400 tracking-widest uppercase">Loading Details</p>
            </div>
        </div>
    );

    if (!listing) return <div className="p-12 text-center font-bold">Listing not found.</div>;

    // Get coordinates for the map
    const coords = CITY_COORDS[listing.county || ''] || CITY_COORDS[listing.city] || CITY_COORDS['Dallas'];

    return (
        <div className="bg-white min-h-screen page-enter pb-16">
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-[360px] shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                        <button
                            onClick={() => { setShowDeleteModal(false); setDeleteError(""); }}
                            className="absolute right-6 top-6 text-zinc-300 hover:text-black transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                            <Trash2 className="text-red-500" size={28} />
                        </div>

                        <h3 className="text-2xl font-black text-[#101010] mb-2 leading-tight">Delete Post</h3>
                        <p className="text-secondary text-[15px] font-medium leading-relaxed mb-6">
                            Enter the 10-digit security code to permanently remove this listing.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    maxLength={10}
                                    placeholder="Enter 10-digit code"
                                    value={deleteCodeInput}
                                    onChange={(e) => setDeleteCodeInput(e.target.value.replace(/\D/g, ''))}
                                    className={`w-full bg-zinc-50 border ${deleteError ? 'border-red-200 bg-red-50' : 'border-zinc-100'} rounded-2xl px-5 py-4 text-[16px] font-bold outline-none placeholder:text-zinc-300 transition-all focus:bg-white`}
                                />
                                {deleteError && (
                                    <div className="flex items-center gap-1.5 mt-2 ml-1 text-red-500">
                                        <AlertCircle size={14} />
                                        <p className="text-xs font-bold uppercase tracking-wide">{deleteError}</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleDelete}
                                disabled={isDeleting || deleteCodeInput.length < 10}
                                className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-sm
                                    ${deleteCodeInput.length === 10
                                        ? 'bg-black text-white hover:bg-zinc-800'
                                        : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'}`}
                            >
                                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="fixed top-0 left-0 w-full h-[64px] bg-white/80 backdrop-blur-md border-b border-zinc-50 z-50 flex items-center justify-between px-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                    <ArrowLeft size={22} className="text-zinc-800" />
                </button>
                <div className="text-center">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">RoomShare</p>
                    <h1 className="text-[15px] font-black text-[#101010] leading-none">Listing Details</h1>
                </div>
                <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400">
                    <Share2 size={20} />
                </button>
            </header>

            {/* Main Content */}
            <main className="max-w-[600px] mx-auto pt-6 px-6">
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[11px] font-black uppercase tracking-wider border border-blue-100">
                        {listing.category}
                    </span>
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-2">
                        {new Date(listing.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                </div>

                <h1 className="text-xl font-black text-[#101010] mb-4 leading-[1.2]">
                    {listing.title}
                </h1>

                <div className="py-4 border-y border-zinc-50 mb-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Posted By</p>
                            <p className="font-bold text-[16px] text-[#101010]">{listing.contact_name || 'Anonymous'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Location</p>
                            <p className="font-bold text-[16px] text-[#101010]">{listing.county || listing.city}</p>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="mb-8 rounded-3xl overflow-hidden border border-zinc-100 shadow-sm h-[200px] relative z-0">
                    <MapContainer
                        center={coords}
                        zoom={13}
                        scrollWheelZoom={false}
                        zoomControl={false}
                        className="h-full w-full"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Circle
                            center={coords}
                            radius={1000}
                            pathOptions={{
                                color: '#2b64dd',
                                fillColor: '#2b64dd',
                                fillOpacity: 0.15,
                                weight: 2
                            }}
                        />
                    </MapContainer>
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-zinc-100 shadow-sm z-[10] flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">General Area</span>
                    </div>
                </div>

                <div className="space-y-4 mb-4">
                    <div>
                        <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2">Description</p>
                        <div className="text-[14px] text-zinc-800 leading-relaxed font-medium whitespace-pre-wrap">
                            {listing.description}
                        </div>
                    </div>
                </div>

                {/* Contact Bar - Dual Buttons */}
                <div className="flex flex-col gap-3 pt-6 border-t border-zinc-50">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center justify-center p-4 bg-zinc-50 hover:bg-zinc-100 text-zinc-400 hover:text-red-500 rounded-[18px] transition-all border border-zinc-100"
                        >
                            <Trash2 size={20} />
                        </button>
                        <a
                            href={`mailto:${listing.contact_email}`}
                            className="flex-1 bg-black text-white font-black text-[15px] py-4 rounded-[18px] hover:opacity-90 shadow-lg shadow-black/5 flex items-center justify-center transition-all active:scale-[0.98]"
                        >
                            Email Seller
                        </a>
                    </div>
                    {listing.telegram_username && (
                        <a
                            href={`https://t.me/${listing.telegram_username.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-[#0088cc] text-white font-black text-[15px] py-4 rounded-[18px] hover:opacity-90 shadow-lg shadow-[#0088cc]/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.33-.26-1.98-.48-.8-.27-1.43-.42-1.37-.89.03-.25.38-.51 1.03-.78 4.04-1.76 6.74-2.92 8.09-3.48 3.85-1.6 4.64-1.88 5.17-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.02.19z" />
                            </svg>
                            Telegram Seller
                        </a>
                    )}
                </div>
            </main>
        </div>
    );
}
