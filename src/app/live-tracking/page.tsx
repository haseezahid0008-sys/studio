
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { getSalesmen } from '@/lib/firestore';
import type { AppUser } from '@/lib/types';
import PageHeader from '@/components/page-header';
import { formatDistanceToNow } from 'date-fns';

// Dynamically import the map components to avoid SSR issues with Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false, loading: () => <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div> });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

function MapDisplay({ salesmen }: { salesmen: AppUser[] }) {
    const salesmenWithLocation = salesmen.filter(s => s.lastLocation && s.lastLocation.latitude && s.lastLocation.longitude);
    const defaultCenter: [number, number] = [30.3753, 69.3451]; // Default center for Pakistan

    return (
        <MapContainer center={defaultCenter} zoom={6} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 1 }}>
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
    );
}


export default function LiveTrackingPage() {
    const [salesmen, setSalesmen] = useState<AppUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSalesmen = async () => {
            try {
                const salesmenData = await getSalesmen();
                setSalesmen(salesmenData);
            } catch (err) {
                console.error(err);
                setError('Failed to load salesmen data. Please try again.');
            } finally {
                // Set loading to false only on the first fetch
                if(isLoading) setIsLoading(false);
            }
        };

        fetchSalesmen();
        
        // Refresh data every 30 seconds
        const interval = setInterval(fetchSalesmen, 30000);
        return () => clearInterval(interval);

    }, [isLoading]);

    return (
        <>
            <PageHeader
                title="Live Salesman Tracking"
                description="View the real-time location of your sales team on the map."
            />
            <div className="h-[calc(100vh-12rem)] w-full rounded-lg overflow-hidden border">
                {isLoading ? (
                     <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-destructive">{error}</p>
                    </div>
                ) : (
                   <MapDisplay salesmen={salesmen} />
                )}
            </div>
        </>
    );
}
