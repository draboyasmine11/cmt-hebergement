import { Centre } from '../models/cmt.models';

export interface UserPosition {
    latitude: number;
    longitude: number;
}

export interface RouteInfo {
    distanceKm: number;
    durationMin: number;
}

export function formatDistance(km: number | undefined): string {
    if (km === undefined || km === null) return '—';
    return km.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' km';
}

export function formatDuration(minutes: number | undefined): string {
    if (minutes === undefined || minutes === null) return '—';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

/** Estimation voiture urbaine (~35 km/h) */
export function estimateDriveMinutes(distanceKm: number): number {
    return Math.max(1, Math.round((distanceKm / 35) * 60));
}

export function googleMapsDirections(dest: Centre, origin?: UserPosition): string {
    const d = `${dest.latitude},${dest.longitude}`;
    if (origin) {
        return `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${d}&travelmode=driving`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${d}&travelmode=driving`;
}

export function wazeNavigation(dest: Centre): string {
    return `https://waze.com/ul?ll=${dest.latitude},${dest.longitude}&navigate=yes`;
}

export function googleMapsSearchNear(query: string, dest: Centre): string {
    return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${dest.latitude},${dest.longitude},15z`;
}

export function formatPhone(phone?: string): string {
    if (!phone) return '+226 25 30 61 00';
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('226') && digits.length >= 11) {
        return `+226 ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`.trim();
    }
    return phone;
}

export async function fetchDrivingRoute(origin: UserPosition, dest: Centre): Promise<RouteInfo | null> {
    if (!dest.latitude || !dest.longitude) return null;
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${dest.longitude},${dest.latitude}?overview=false`;
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const route = data.routes?.[0];
        if (!route) return null;
        return {
            distanceKm: Math.round((route.distance / 1000) * 10) / 10,
            durationMin: Math.round(route.duration / 60)
        };
    } catch {
        return null;
    }
}

export async function fetchRouteGeometry(origin: UserPosition, dest: Centre): Promise<[number, number][] | null> {
    if (!dest.latitude || !dest.longitude) return null;
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${dest.longitude},${dest.latitude}?overview=full&geometries=geojson`;
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const coords: [number, number][] = data.routes?.[0]?.geometry?.coordinates;
        if (!coords?.length) return null;
        return coords.map(([lon, lat]) => [lat, lon]);
    } catch {
        return null;
    }
}
