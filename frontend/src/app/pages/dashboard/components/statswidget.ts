import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatistiquesService } from '@/app/core/services/statistiques.service';
import { AuthService } from '@/app/core/services/auth.service';
import { Statistiques } from '@/app/core/models/cmt.models';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: `
        @if (auth.isAdmin() && stats()) {
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Centres</span>
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats()!.totalCentres }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-building text-blue-500 text-xl!"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Chambres disponibles</span>
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats()!.chambresDisponibles }} / {{ stats()!.totalChambres }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-home text-green-500 text-xl!"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Réservations ce mois</span>
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats()!.reservationsMois }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-calendar text-orange-500 text-xl!"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Revenus générés</span>
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats()!.revenusGeneres | number }} FCFA</div>
                        </div>
                        <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-wallet text-cyan-500 text-xl!"></i>
                        </div>
                    </div>
                    <span class="text-primary font-medium">{{ stats()!.tauxOccupation }}% </span>
                    <span class="text-muted-color">taux d'occupation</span>
                </div>
            </div>
        } @else {
            <div class="col-span-12">
                <div class="card mb-0 p-6">
                    <h3 class="text-xl font-semibold mb-2">Bienvenue, {{ auth.user()?.prenom }} {{ auth.user()?.nom }}</h3>
                    <p class="text-muted-color">Utilisez le menu pour accéder aux fonctionnalités CMT SONABEL.</p>
                </div>
            </div>
        }
    `
})
export class StatsWidget implements OnInit {
    auth = inject(AuthService);
    private statistiquesService = inject(StatistiquesService);
    stats = signal<Statistiques | null>(null);

    ngOnInit() {
        if (this.auth.isAdmin()) {
            this.statistiquesService.getStatistiques().subscribe({
                next: (s) => this.stats.set(s),
                error: () => {}
            });
        }
    }
}
