
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { getSalesmen } from '@/lib/firestore';
import type { AppUser } from '@/lib/types';
import PageHeader from '@/components/page-header';
import { formatDistanceToNow } from 'date-fns';

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

export default function LiveTrackingPage() {
    const [salesmen, setSalesmen] = useState<AppUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const fetchSalesmen = async () => {
            try {
                // No need to set loading to true on interval refresh
                const salesmenData = await getSalesmen();
                setSalesmen(salesmenData);
            } catch (err) {
                console.error(err);
                setError('Failed to load salesmen data. Please try again.');
            } finally {
                setIsLoading(false); // Only set loading to false after initial fetch
            }
        };

        fetchSalesmen();
        
        // Refresh data every 30 seconds
        const interval = setInterval(fetchSalesmen, 30000);
        return () => clearInterval(interval);

    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return <p className="text-destructive">{error}</p>;
    }
    
    // Filter salesmen who have location data
    const salesmenWithLocation = salesmen.filter(s => s.lastLocation && s.lastLocation.latitude && s.lastLocation.longitude);

    // Default center for the map, e.g., a central point in Pakistan
    const defaultCenter: [number, number] = [30.3753, 69.3451];

    return (
        <>
            <PageHeader
                title="Live Salesman Tracking"
                description="View the real-time location of your sales team on the map."
            />
            <div className="h-[calc(100vh-12rem)] w-full">
                <style>
                    {`.leaflet-container { height: 100%; width: 100%; z-index: 1; }`}
                </style>
                {isClient && (
                    <MapContainer center={defaultCenter} zoom={6} scrollWheelZoom={true}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {salesmenWithLocation.map(salesman => (
                            <Marker
                                key={salesman.uid}
                                position={[salesman.lastLocation!.latitude, salesman.lastLocation!.longitude]}
                            >
                                <Popup>
                                    <div className="font-bold">{salesman.name}</div>
                                    {salesman.lastLocation?.timestamp && (
                                        <div>
                                            Last updated: {formatDistanceToNow(new Date(salesman.lastLocation.timestamp), { addSuffix: true })}
                                        </div>
                                    )}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>
        </>
    );
}
