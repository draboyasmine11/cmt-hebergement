import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { StatistiquesService } from '@/app/core/services/statistiques.service';
import { CentreService } from '@/app/core/services/centre.service';
import { ChambreService } from '@/app/core/services/chambre.service';
import { ReservationService } from '@/app/core/services/reservation.service';
import { PaiementService } from '@/app/core/services/paiement.service';
import { AuthService } from '@/app/core/services/auth.service';
import { CentreActifService } from '@/app/core/services/centre-actif.service';
import { Statistiques, Chambre, Reservation, Paiement } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-rapports',
    standalone: true,
    imports: [CommonModule, FormsModule, ChartModule],
    template: `
        <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-extrabold text-slate-800">Rapports & Statistiques</h1>
                    <p class="text-sm text-slate-500 mt-1">Vue d'ensemble des performances du système CMT-SONABEL.</p>
                </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-2">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total réservations</span>
                    <span class="text-2xl font-extrabold text-slate-800">{{ totalReservations() }}</span>
                    <span class="text-[10px] text-slate-400">Toutes périodes</span>
                </div>
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-2">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenus (FCFA)</span>
                    <span class="text-2xl font-extrabold text-slate-800">{{ totalRevenus() | number }}</span>
                    <span class="text-[10px] text-slate-400">Total cumulé</span>
                </div>
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-2">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taux d'occupation</span>
                    <span class="text-2xl font-extrabold text-slate-800">{{ tauxOccupation() | number:'1.0-0' }}%</span>
                    <span class="text-[10px] text-slate-400">Moyen du centre</span>
                </div>
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-2">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total chambres</span>
                    <span class="text-2xl font-extrabold text-slate-800">{{ chambres().length }}</span>
                    <span class="text-[10px] text-slate-400">{{ chambresDisponibles() }} disponibles</span>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-6">
                <div class="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 class="font-extrabold text-slate-800 mb-4">Évolution des réservations</h3>
                    @if (barData) {
                        <div class="h-72"><p-chart type="line" [data]="barData" [options]="barOptions"></p-chart></div>
                    } @else {
                        <div class="h-64 flex items-center justify-center text-slate-400 text-sm">Aucune donnée de réservation.</div>
                    }
                </div>
                <div class="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 class="font-extrabold text-slate-800 mb-4">État des chambres</h3>
                    @if (chambres().length > 0) {
                        <div class="h-64 flex items-center justify-center">
                            <p-chart type="doughnut" [data]="donutData" [options]="donutOptions" class="max-w-[200px]"></p-chart>
                        </div>
                    } @else {
                        <div class="h-64 flex items-center justify-center text-slate-400 text-sm">Aucune chambre configurée.</div>
                    }
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 class="font-extrabold text-slate-800 mb-4">Centres d'hébergement</h3>
                @if (centres().length > 0) {
                    <div class="flex flex-col gap-3">
                        @for (c of centres(); track c.id) {
                            <div class="flex items-center gap-4">
                                <span class="text-xs font-bold text-slate-700 w-40 shrink-0">{{ c.nom }}</span>
                                <span class="text-xs text-slate-500 w-24">{{ c.ville }}</span>
                                <span class="text-xs text-slate-500">{{ c.statut === 'ACTIF' ? 'Disponible' : 'Indisponible' }}</span>
                            </div>
                        }
                    </div>
                } @else {
                    <div class="flex items-center justify-center py-8 text-slate-400 text-sm">Aucun centre configuré.</div>
                }
            </div>
        </div>
    `
})
export class Rapports implements OnInit {
    private statistiquesService = inject(StatistiquesService);
    private centreService = inject(CentreService);
    private chambreService = inject(ChambreService);
    private reservationService = inject(ReservationService);
    private paiementService = inject(PaiementService);
    private auth = inject(AuthService);
    private centreActif = inject(CentreActifService);

    stats = signal<Statistiques | null>(null);
    centres = signal<any[]>([]);
    chambres = signal<Chambre[]>([]);
    reservations = signal<Reservation[]>([]);
    paiements = signal<Paiement[]>([]);

    totalReservations = computed(() => this.auth.isAdmin()
        ? (this.stats()?.totalReservations ?? 0)
        : this.reservations().length);

    totalRevenus = computed(() => this.auth.isAdmin()
        ? Number(this.stats()?.revenusGeneres ?? 0)
        : this.paiements().reduce((s, p) => s + (p.montant ?? 0), 0));

    chambresDisponibles = computed(() => this.auth.isAdmin()
        ? (this.stats()?.chambresDisponibles ?? 0)
        : this.chambres().filter(c => c.statut === 'DISPONIBLE').length);

    tauxOccupation = computed(() => {
        if (this.auth.isAdmin()) return this.stats()?.tauxOccupation ?? 0;
        const total = this.chambres().length;
        if (!total) return 0;
        const occ = this.chambres().filter(c => c.statut === 'OCCUPEE').length;
        return Math.round((occ / total) * 100);
    });

    barData: any;
    barOptions: any = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: { position: 'top', labels: { font: { size: 11, weight: 'bold' }, color: '#334155', padding: 16 } },
            tooltip: { backgroundColor: '#0f172a', titleFont: { size: 12 }, bodyFont: { size: 11 }, padding: 10, cornerRadius: 8 }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#64748b' } },
            y: { beginAtZero: true, grid: { color: '#f1f5f9', drawBorder: false }, ticks: { stepSize: 1, font: { size: 10 }, color: '#64748b' } }
        }
    };
    donutData: any;
    donutOptions: any = { maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } };

    ngOnInit() {
        this.centreService.getAll().subscribe(list => this.centres.set(list || []));

        if (this.auth.isAdmin()) {
            this.statistiquesService.getStatistiques().subscribe(s => {
                this.stats.set(s);
                this.buildBarChartFromStats(s);
            });
            this.chambreService.getAll().subscribe(list => {
                this.chambres.set(list || []);
                this.buildDonutFromChambres(list || []);
            });
        } else {
            const centreId = this.auth.user()?.centreId ?? this.centreActif.centreActif()?.id;
            if (!centreId) return;

            this.chambreService.getByCentre(centreId).subscribe(list => {
                this.chambres.set(list || []);
                this.buildDonutFromChambres(list || []);
            });

            this.reservationService.getByCentre(centreId).subscribe(list => {
                this.reservations.set(list || []);
                this.buildBarChartFromReservations(list || []);
            });

            this.paiementService.getByCentre(centreId).subscribe(list => {
                this.paiements.set(list || []);
            });
        }
    }

    private buildBarChartFromStats(s: Statistiques) {
        if (!s.reservationsParMois?.length) return;
        const labels = s.reservationsParMois.map(r => new Date(r.annee, r.mois - 1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }));
        const data = s.reservationsParMois.map(r => r.total);
        this.barData = {
            labels,
            datasets: [{
                label: 'Réservations',
                data,
                borderColor: '#00529B',
                backgroundColor: 'rgba(0,82,155,0.08)',
                pointBackgroundColor: '#00529B',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.3,
                borderWidth: 2
            }]
        };
    }

    private buildBarChartFromReservations(list: Reservation[]) {
        if (!list.length) return;
        const days: Record<string, number> = {};
        list.forEach(r => {
            const d = new Date(r.dateReservation);
            const key = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            days[key] = (days[key] ?? 0) + 1;
        });
        const labels = Object.keys(days).sort((a, b) => {
            const parse = (s: string) => new Date(s.split(' ').reverse().join(' '));
            return parse(a).getTime() - parse(b).getTime();
        });
        this.barData = {
            labels,
            datasets: [{
                label: 'Réservations',
                data: labels.map(k => days[k]),
                borderColor: '#00529B',
                backgroundColor: 'rgba(0,82,155,0.08)',
                pointBackgroundColor: '#00529B',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.3,
                borderWidth: 2
            }]
        };
    }

    private buildDonutFromChambres(list: Chambre[]) {
        const dispo = list.filter(c => c.statut === 'DISPONIBLE').length;
        const occ = list.filter(c => c.statut === 'OCCUPEE').length;
        const maint = list.filter(c => c.statut === 'MAINTENANCE').length;
        this.donutData = {
            labels: ['Disponible', 'Occupée', 'Maintenance'],
            datasets: [{ data: [dispo, occ, maint], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], borderWidth: 0 }]
        };
    }
}
