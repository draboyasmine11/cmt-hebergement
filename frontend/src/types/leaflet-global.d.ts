/* Leaflet chargé via CDN dans index.html */
declare namespace L {
    class LatLngBounds {
        constructor(latlngs: [number, number][]);
    }
    class Map {
        constructor(id: string, options?: object);
        setView(latlng: [number, number], zoom: number): this;
        fitBounds(bounds: LatLngBounds, options?: { padding?: [number, number] }): this;
        remove(): void;
    }
    class Marker {
        constructor(latlng: [number, number], options?: object);
        addTo(map: Map): this;
        bindPopup(content: string): this;
        openPopup(): this;
        remove(): void;
    }
    class Polyline {
        constructor(latlngs: [number, number][], options?: object);
        addTo(map: Map): this;
        remove(): void;
    }
    class CircleMarker {
        constructor(latlng: [number, number], options?: object);
        addTo(map: Map): this;
        bindPopup(content: string): this;
        remove(): void;
    }
    function map(id: string, options?: object): Map;
    function tileLayer(url: string, options?: object): { addTo(map: Map): void };
    function marker(latlng: [number, number], options?: object): Marker;
    function polyline(latlngs: [number, number][], options?: object): Polyline;
    function circleMarker(latlng: [number, number], options?: object): CircleMarker;
    function latLngBounds(latlngs: [number, number][]): LatLngBounds;
}

declare const L: {
    map(id: string, options?: object): L.Map;
    tileLayer(url: string, options?: object): { addTo(map: L.Map): void };
    marker(latlng: [number, number], options?: object): L.Marker;
    polyline(latlngs: [number, number][], options?: object): L.Polyline;
    circleMarker(latlng: [number, number], options?: object): L.CircleMarker;
    latLngBounds(latlngs: [number, number][]): L.LatLngBounds;
};
