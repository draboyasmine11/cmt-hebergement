import { Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { CentreService } from '@/app/core/services/centre.service';
import { Centre } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-carte',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, CardModule, TooltipModule],
    template: `
        <div class="min-h-screen bg-white font-sans flex flex-col justify-between">
            <!-- Header -->
            <header class="bg-white shadow-sm sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3 shrink-0">
                        <img src="/logo_cmt.jpg" alt="Logo CMT" class="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover" />
                        <img src="/logo_sonabel.jpg" alt="Logo SONABEL" class="h-8 sm:h-10 w-auto hidden sm:block object-contain" />
                    </div>

                    <nav class="hidden xl:flex items-center gap-7 font-semibold text-slate-600 text-sm">
                        <a routerLink="/accueil" class="hover:text-primary transition-colors cursor-pointer">Accueil</a>
                        <a routerLink="/accueil" class="hover:text-primary transition-colors cursor-pointer">Centres d'hébergement</a>
                        <a routerLink="/auth/login" class="hover:text-primary transition-colors cursor-pointer">Chambres</a>
                        <a routerLink="/auth/login" class="hover:text-primary transition-colors cursor-pointer">Réservations</a>
                    </nav>

                    <button routerLink="/auth/login"
                        class="w-10 h-10 rounded-xl bg-[#00529B] hover:bg-[#00407a] flex items-center justify-center text-white cursor-pointer transition-colors"
                        title="Se connecter">
                        <i class="pi pi-search text-base"></i>
                    </button>
                </div>
            </header>

            <!-- Map Layout -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-grow">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-slate-800">Carte des centres CMT</h2>
                    <p-button label="Retour" icon="pi pi-arrow-left" [text]="true" routerLink="/accueil" pTooltip="Retourner à la page d'accueil" tooltipPosition="left" />
                </div>
                <div class="grid grid-cols-12 gap-6">
                    <div class="col-span-12 lg:col-span-8">
                        <div class="card p-0 overflow-hidden border border-slate-100 shadow-md rounded-2xl">
                            <div id="cmt-map" style="height: 500px; width: 100%;"></div>
                        </div>
                    </div>
                    <div class="col-span-12 lg:col-span-4">
                        <div class="card bg-white p-6 border border-slate-100 shadow-md rounded-2xl">
                            <h3 class="text-lg font-semibold mb-4 text-slate-800">Centres CMT</h3>
                            <p-button label="Me localiser" icon="pi pi-map-marker" class="w-full mb-4" (onClick)="localiser()" pTooltip="Utiliser votre position GPS pour trouver le centre CMT le plus proche" tooltipPosition="top" />
                            @if (centreProche()) {
                                <div class="p-4 bg-blue-50/70 border border-blue-100 rounded-xl mb-4">
                                    <p class="font-semibold text-primary">Centre le plus proche</p>
                                    <p class="text-slate-700 font-medium">{{ centreProche()!.nom }}</p>
                                    <p class="text-xs text-slate-500 mt-1"><i class="pi pi-compass mr-1"></i>{{ centreProche()!.distanceKm }} km</p>
                                </div>
                            }
                            <div class="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-2">
                                @for (c of centres(); track c.id) {
                                    <div class="p-3 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors" (click)="focusCentre(c)">
                                        <p class="font-bold text-slate-800 text-sm">{{ c.nom }}</p>
                                        <p class="text-xs text-slate-500 mt-0.5">{{ c.ville }} · {{ c.adresse }}</p>
                                        @if (c.distanceKm !== undefined) {
                                            <p class="text-xs text-primary font-bold mt-1"><i class="pi pi-compass mr-1"></i>{{ c.distanceKm }} km</p>
                                        }
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <footer class="bg-[#0f172a] text-slate-300 pt-10 pb-6 px-4 sm:px-6 w-full">
                <div class="max-w-7xl mx-auto text-center text-xs text-slate-500">
                    <p>© 2026 SONABEL - Tous droits réservés | CMT - Système de gestion des centres d'hébergement</p>
                </div>
            </footer>
        </div>
    `
})
export class Carte implements OnInit, AfterViewInit {
    private centreService = inject(CentreService);

    centres = signal<Centre[]>([]);
    centreProche = signal<Centre | null>(null);
    private map?: L.Map;
    private markers: L.Marker[] = [];

    ngOnInit() {
        this.centreService.getAll().subscribe((c) => {
            this.centres.set(c);
            setTimeout(() => this.addMarkers(c), 100);
        });
    }

    ngAfterViewInit() {
        this.map = L.map('cmt-map').setView([12.37, -1.52], 7);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(this.map);
    }

    localiser() {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            this.centreService.getProches(latitude, longitude).subscribe((centres) => {
                this.centres.set(centres);
                this.centreProche.set(centres[0] ?? null);
                this.addMarkers(centres);
                this.map?.setView([latitude, longitude], 8);
                L.marker([latitude, longitude]).addTo(this.map!).bindPopup('Votre position').openPopup();
            });
        });
    }

    focusCentre(c: Centre) {
        if (c.latitude && c.longitude) {
            this.map?.setView([c.latitude, c.longitude], 14);
        }
    }

    private addMarkers(centres: Centre[]) {
        if (!this.map) return;
        this.markers.forEach((m) => m.remove());
        this.markers = [];
        centres.forEach((c) => {
            if (c.latitude && c.longitude) {
                const marker = L.marker([c.latitude, c.longitude])
                    .addTo(this.map!)
                    .bindPopup(`<b>${c.nom}</b><br>${c.ville}`);
                this.markers.push(marker);
            }
        });
    }
}
