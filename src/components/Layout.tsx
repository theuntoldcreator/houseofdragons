
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import LocationModal from './LocationModal';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { supabase } from '../lib/supabase';

export default function Layout() {
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedArea, setSelectedArea] = useState('All Areas');
    const [availableAreas, setAvailableAreas] = useState<string[]>([]);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('selected_city');
        if (saved) {
            setSelectedCity(saved);
        } else {
            setIsLocationModalOpen(true);
        }
    }, []);

    // Reset area and fetch new available areas when city changes
    useEffect(() => {
        setSelectedArea('All Areas');
        if (selectedCity) {
            fetchActiveAreas();
        }
    }, [selectedCity]);

    const fetchActiveAreas = async () => {
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('county')
                .eq('city', selectedCity)
                .not('county', 'is', null);

            if (error) throw error;

            // Get unique counties and filter out empty strings
            const uniqueAreas = Array.from(new Set(data.map(item => item.county)))
                .filter(Boolean) as string[];

            setAvailableAreas(uniqueAreas.sort());
        } catch (err) {
            console.error('Error fetching active areas:', err);
        }
    };

    return (
        <div className="min-h-screen bg-white text-[#101010] font-sans selection:bg-black selection:text-white">
            <LocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                onSelect={(city: string) => setSelectedCity(city)}
            />

            <Sidebar
                selectedCity={selectedCity}
                onLocationClick={() => setIsLocationModalOpen(true)}
            />

            <Header
                selectedArea={selectedArea}
                availableAreas={availableAreas}
                onAreaChange={setSelectedArea}
            />

            <div className="lg:pl-[240px]">
                <main className="w-full max-w-[570px] mx-auto pt-[64px] pb-[90px] lg:pb-[80px]">
                    <Outlet context={{ selectedCity, selectedArea, setSelectedArea }} />
                </main>
            </div>

            <BottomNav
                selectedCity={selectedCity}
                onLocationClick={() => setIsLocationModalOpen(true)}
            />
        </div>
    );
}
