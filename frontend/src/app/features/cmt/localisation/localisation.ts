import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { CentreService } from '@/app/core/services/centre.service';
import { Centre } from '@/app/core/models/cmt.models';
import {
    UserPosition,
    formatDistance,
    formatDuration,
    formatPhone,
    estimateDriveMinutes,
    googleMapsDirections,
    wazeNavigation,
    googleMapsSearchNear,
    fetchDrivingRoute,
    fetchRouteGeometry
} from '@/app/core/utils/geo.util';

@Component({
    selector: 'app-localisation',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, TagModule, MessageModule],
    template: `
        <div class="p-4 max-w-7xl mx-auto">
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-1">Localisation</h2>
                <p class="text-muted-color">Trouvez votre centre CMT, consultez l'itinéraire et lancez la navigation.</p>
            </div>

            @if (geoError()) {
                <p-message severity="warn" styleClass="w-full mb-4" [text]="geoError()!" />
            }

            @if (loading()) {
                <div class="card text-center py-12 text-muted-color">
                    <i class="pi pi-spin pi-spinner text-3xl mb-3"></i>
                    <p>Chargement des centres...</p>
                </div>
            } @else if (centreActif(); as centre) {
                <!-- Centre le plus proche -->
                @if (position() && centreProche(); as proche) {
                    @if (proche.id === centre.id) {
                    <div class="mb-4 p-4 rounded-2xl bg-primary/10 border border-primary/20">
                        <p class="text-sm text-primary font-semibold mb-1">
                            <i class="pi pi-map-marker mr-2"></i>Centre le plus proche
                        </p>
                        <p class="text-lg font-bold text-surface-900 dark:text-surface-0">
                            {{ centre.nom }} : {{ resumeTrajet() }}
                        </p>
                    </div>
                    }
                }

                <div class="grid grid-cols-12 gap-6">
                    <!-- Carte -->
                    <div class="col-span-12 lg:col-span-8">
                        <div class="card p-0 overflow-hidden rounded-2xl border border-surface">
                            <div id="localisation-map" class="w-full" style="height: 420px;"></div>
                        </div>
                    </div>

                    <!-- Infos centre -->
                    <div class="col-span-12 lg:col-span-4 flex flex-col gap-4">
                        <div class="card rounded-2xl">
                            <h3 class="text-xl font-bold mb-1">{{ centre.nom }}</h3>
                            <p-tag [value]="centre.ville" severity="info" class="mb-4" />

                            <div class="flex flex-col gap-3 text-sm">
                                <div class="flex gap-3">
                                    <i class="pi pi-map-marker text-primary mt-0.5"></i>
                                    <div>
                                        <p class="font-semibold text-surface-900 dark:text-surface-0">Adresse</p>
                                        <p class="text-muted-color">{{ centre.adresse }}, {{ centre.ville }}</p>
                                    </div>
                                </div>
                                <div class="flex gap-3">
                                    <i class="pi pi-phone text-primary mt-0.5"></i>
                                    <div>
                                        <p class="font-semibold">Téléphone</p>
                                        <a [href]="'tel:' + (centre.telephone || '+22625306100')" class="text-primary font-medium">
                                            {{ formatPhone(centre.telephone) }}
                                        </a>
                                    </div>
                                </div>
                                @if (position()) {
                                    <div class="flex gap-3">
                                        <i class="pi pi-compass text-primary mt-0.5"></i>
                                        <div>
                                            <p class="font-semibold">Distance</p>
                                            <p class="text-muted-color">{{ formatDistance(distanceActuelle()) }} depuis votre position</p>
                                        </div>
                                    </div>
                                    <div class="flex gap-3">
                                        <i class="pi pi-clock text-primary mt-0.5"></i>
                                        <div>
                                            <p class="font-semibold">Temps de trajet estimé</p>
                                            <p class="text-muted-color">{{ formatDuration(dureeActuelle()) }} en voiture</p>
                                        </div>
                                    </div>
                                }
                            </div>

                            <!-- Boutons principaux -->
                            <div class="mt-6 flex flex-col gap-3">
                                <button
                                    type="button"
                                    class="w-full bg-[#00529B] hover:bg-[#00407a] text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-colors"
                                    (click)="ouvrirGoogleMaps()"
                                >
                                    <i class="pi pi-directions text-xl"></i>
                                    Me guider vers le centre
                                </button>
                                <div class="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        class="py-3 px-4 rounded-xl border border-surface font-semibold text-sm hover:bg-emphasis transition-colors flex items-center justify-center gap-2"
                                        (click)="afficherItineraire()"
                                    >
                                        <i class="pi pi-map"></i>
                                        Itinéraire
                                    </button>
                                    <button
                                        type="button"
                                        class="py-3 px-4 rounded-xl border border-surface font-semibold text-sm hover:bg-emphasis transition-colors flex items-center justify-center gap-2"
                                        (click)="ouvrirWaze()"
                                    >
                                        <i class="pi pi-external-link"></i>
                                        Waze
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    class="w-full py-2.5 text-primary font-semibold text-sm"
                                    (click)="localiser()"
                                    [disabled]="geoLoading()"
                                >
                                    @if (geoLoading()) {
                                        <i class="pi pi-spin pi-spinner mr-2"></i>
                                    } @else {
                                        <i class="pi pi-crosshairs mr-2"></i>
                                    }
                                    Actualiser ma position
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Autres centres proches -->
                @if (autresCentres().length > 0) {
                    <div class="card mt-6 rounded-2xl">
                        <h3 class="text-lg font-bold mb-4">Centres CMT à proximité</h3>
                        <div class="grid grid-cols-12 gap-4">
                            @for (c of autresCentres(); track c.id) {
                                <div class="col-span-12 md:col-span-6 lg:col-span-4">
                                    <button
                                        type="button"
                                        class="w-full text-left p-4 rounded-xl border border-surface hover:border-primary hover:bg-primary/5 transition-all"
                                        (click)="selectionnerCentre(c)"
                                    >
                                        <p class="font-bold">{{ c.nom }}</p>
                                        <p class="text-sm text-muted-color">{{ c.ville }}</p>
                                        @if (c.distanceKm !== undefined) {
                                            <p class="text-sm text-primary font-semibold mt-1">{{ formatDistance(c.distanceKm) }}</p>
                                        }
                                    </button>
                                </div>
                            }
                        </div>
                    </div>
                }

                <!-- Services à proximité -->
                <div class="card mt-6 rounded-2xl">
                    <h3 class="text-lg font-bold mb-2">Services utiles autour du centre</h3>
                    <p class="text-sm text-muted-color mb-4">Recherchez sur la carte les commerces et services à proximité.</p>
                    <div class="flex flex-wrap gap-2">
                        @for (svc of servicesProximite; track svc.label) {
                            <button
                                type="button"
                                class="px-4 py-2 rounded-full border border-surface text-sm font-medium hover:bg-emphasis transition-colors flex items-center gap-2"
                                (click)="ouvrirService(svc.query)"
                            >
                                <i [class]="svc.icon"></i>
                                {{ svc.label }}
                            </button>
                        }
                    </div>
                </div>
            }
        </div>
    `
})
export class Localisation implements OnInit, AfterViewInit, OnDestroy {
    private centreService = inject(CentreService);

    loading = signal(true);
    geoLoading = signal(false);
    geoError = signal<string | null>(null);
    position = signal<UserPosition | null>(null);
    centres = signal<Centre[]>([]);
    centreActif = signal<Centre | null>(null);
    dureeTrajet = signal<number | undefined>(undefined);

    centreProche = computed(() => this.centres()[0] ?? null);
    autresCentres = computed(() => {
        const actif = this.centreActif();
        return this.centres().filter((c) => c.id !== actif?.id);
    });
    distanceActuelle = computed(() => {
        const c = this.centreActif();
        return c?.distanceKm ?? this.centreProche()?.distanceKm;
    });
    dureeActuelle = computed(() => {
        const d = this.dureeTrajet();
        if (d !== undefined) return d;
        const km = this.distanceActuelle();
        return km !== undefined ? estimateDriveMinutes(km) : undefined;
    });
    resumeTrajet = computed(() => {
        const c = this.centreActif();
        if (!c) return '';
        const dist = formatDistance(this.distanceActuelle());
        const duree = formatDuration(this.dureeActuelle());
        return `${duree} en voiture depuis votre position (${dist})`;
    });

    readonly formatDistance = formatDistance;
    readonly formatDuration = formatDuration;
    readonly formatPhone = formatPhone;

    readonly servicesProximite = [
        { label: 'Pharmacie', icon: 'pi pi-plus', query: 'pharmacie' },
        { label: 'Station-service', icon: 'pi pi-car', query: 'station service' },
        { label: 'Banque', icon: 'pi pi-building', query: 'banque' },
        { label: 'Restaurant', icon: 'pi pi-shopping-bag', query: 'restaurant' },
        { label: 'Hôpital', icon: 'pi pi-heart', query: 'hôpital' }
    ];

    private map?: L.Map;
    private centreMarker?: L.Marker;
    private userMarker?: L.CircleMarker;
    private routeLine?: L.Polyline;
    private mapReady = false;

    ngOnInit() {
        this.centreService.getAll().subscribe({
            next: (list) => {
                this.centres.set(list);
                if (list.length) {
                    this.centreActif.set(list[0]);
                }
                this.loading.set(false);
                setTimeout(() => this.initMapIfNeeded(), 100);
                this.localiser();
            },
            error: () => this.loading.set(false)
        });
    }

    ngAfterViewInit() {
        setTimeout(() => this.initMapIfNeeded(), 100);
    }

    ngOnDestroy() {
        this.map?.remove();
    }

    localiser() {
        if (!navigator.geolocation) {
            this.geoError.set('La géolocalisation n\'est pas disponible sur cet appareil.');
            return;
        }
        this.geoLoading.set(true);
        this.geoError.set(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const userPos: UserPosition = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                this.position.set(userPos);
                this.centreService.getProches(userPos.latitude, userPos.longitude).subscribe({
                    next: (proches) => {
                        this.centres.set(proches);
                        this.centreActif.set(proches[0] ?? this.centreActif());
                        this.geoLoading.set(false);
                        this.actualiserTrajet();
                        this.refreshMap();
                    },
                    error: () => {
                        this.geoLoading.set(false);
                        this.refreshMap();
                    }
                });
            },
            () => {
                this.geoLoading.set(false);
                this.geoError.set('Autorisez l\'accès à votre position pour voir la distance et l\'itinéraire.');
                this.refreshMap();
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    }

    selectionnerCentre(centre: Centre) {
        this.centreActif.set(centre);
        this.actualiserTrajet();
        this.refreshMap();
    }

    afficherItineraire() {
        const centre = this.centreActif();
        const userPos = this.position();
        if (!centre?.latitude || !centre.longitude) return;
        if (userPos) {
            this.tracerItineraire(userPos, centre);
        } else {
            this.geoError.set('Activez votre position GPS pour afficher l\'itinéraire sur la carte.');
            this.localiser();
        }
    }

    ouvrirGoogleMaps() {
        const centre = this.centreActif();
        if (!centre) return;
        window.open(googleMapsDirections(centre, this.position() ?? undefined), '_blank');
    }

    ouvrirWaze() {
        const centre = this.centreActif();
        if (!centre) return;
        window.open(wazeNavigation(centre), '_blank');
    }

    ouvrirService(query: string) {
        const centre = this.centreActif();
        if (!centre?.latitude || !centre.longitude) return;
        window.open(googleMapsSearchNear(query, centre), '_blank');
    }

    private async actualiserTrajet() {
        const centre = this.centreActif();
        const userPos = this.position();
        if (!centre || !userPos || !centre.latitude || !centre.longitude) {
            this.dureeTrajet.set(undefined);
            return;
        }
        const route = await fetchDrivingRoute(userPos, centre);
        if (route) {
            this.dureeTrajet.set(route.durationMin);
        } else {
            const km = centre.distanceKm ?? 0;
            this.dureeTrajet.set(km > 0 ? estimateDriveMinutes(km) : undefined);
        }
    }

    private initMapIfNeeded() {
        if (this.mapReady || this.loading() || !this.centreActif()) return;
        const el = document.getElementById('localisation-map');
        if (!el) return;
        this.map = L.map('localisation-map').setView([12.37, -1.52], 7);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(this.map);
        this.mapReady = true;
        this.refreshMap();
    }

    private async tracerItineraire(userPos: UserPosition, centre: Centre) {
        const geometry = await fetchRouteGeometry(userPos, centre);
        if (!this.map) return;
        this.routeLine?.remove();
        if (geometry?.length) {
            this.routeLine = L.polyline(geometry, { color: '#00529B', weight: 5, opacity: 0.8 }).addTo(this.map);
            this.map.fitBounds(L.latLngBounds(geometry), { padding: [40, 40] });
        }
    }

    private refreshMap() {
        if (!this.mapReady || !this.map) return;
        const centre = this.centreActif();
        const userPos = this.position();

        this.centreMarker?.remove();
        this.userMarker?.remove();
        this.routeLine?.remove();
        this.routeLine = undefined;

        if (centre?.latitude && centre.longitude) {
            this.centreMarker = L.marker([centre.latitude, centre.longitude])
                .addTo(this.map)
                .bindPopup(`<b>${centre.nom}</b><br>${centre.adresse}`);
            this.map.setView([centre.latitude, centre.longitude], userPos ? 12 : 14);
        }

        if (userPos) {
            this.userMarker = L.circleMarker([userPos.latitude, userPos.longitude], {
                radius: 10,
                color: '#00529B',
                fillColor: '#00529B',
                fillOpacity: 0.7
            })
                .addTo(this.map)
                .bindPopup('Votre position');
            if (centre?.latitude && centre.longitude) {
                this.tracerItineraire(userPos, centre);
            }
        }
    }
}
