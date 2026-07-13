import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ReservationService } from '@/app/core/services/reservation.service';
import { Reservation } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-mes-sejours',
    standalone: true,
    imports: [CommonModule, CardModule, TagModule, ButtonModule],
    template: `
        <div class="flex flex-col gap-6 font-sans text-slate-800">
            <div>
                <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-800">Mes séjours</h1>
                <p class="text-sm text-slate-500 mt-1">Consultez l'historique de vos séjours dans les centres CMT-SONABEL.</p>
            </div>

            @if (sejours().length === 0) {
                <div class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
                        <i class="pi pi-calendar-times text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-extrabold text-slate-400">Aucun séjour</h3>
                    <p class="text-sm text-slate-400 mt-1">Vous n'avez pas encore effectué de séjour.</p>
                </div>
            } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    @for (s of sejours(); track $index) {
                        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div class="p-5 flex flex-col gap-4">
                                <div class="flex items-start justify-between">
                                    <div>
                                        <h3 class="font-extrabold text-slate-800 text-base">{{ s.centreNom }}</h3>
                                        <p class="text-sm font-semibold text-slate-500 mt-0.5">
                                            {{ s.chambreNumero }} <span class="text-slate-400 text-xs">· {{ s.chambreType || 'Standard' }}</span>
                                        </p>
                                    </div>
                                    <p-tag
                                        [value]="statutSejourLabel(s)"
                                        [severity]="statutSejourSeverity(s)"
                                    />
                                </div>

                                <div class="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Arrivée</span>
                                        <p class="font-bold text-slate-700 mt-0.5">{{ s.dateArrivee | date:'dd/MM/yyyy' }}</p>
                                    </div>
                                    <div>
                                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Départ</span>
                                        <p class="font-bold text-slate-700 mt-0.5">{{ s.dateDepart | date:'dd/MM/yyyy' }}</p>
                                    </div>
                                </div>

                                <div class="flex items-center gap-2 pt-2 border-t border-slate-50">
                                    <i class="pi pi-clock text-slate-400 text-xs"></i>
                                    <span class="text-xs font-bold text-slate-600">
                                        Durée : {{ duree(s.dateArrivee, s.dateDepart) }} nuit(s)
                                    </span>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
    `
})
export class MesSejours implements OnInit {
    private reservationService = inject(ReservationService);

    sejours = signal<Reservation[]>([]);

    ngOnInit() {
        this.reservationService.getMesReservations().subscribe((res) => {
            this.sejours.set((res || []).filter(r => r.statut === 'VALIDEE' || r.statut === 'EN_ATTENTE'));
        });
    }

    statutSejourLabel(s: Reservation): string {
        if (s.statut !== 'VALIDEE') return 'À venir';
        const today = new Date().toISOString().split('T')[0];
        return s.dateDepart < today ? 'Terminé' : 'En cours';
    }

    statutSejourSeverity(s: Reservation): 'secondary' | 'info' | 'warn' | 'success' | 'danger' | 'contrast' {
        if (s.statut !== 'VALIDEE') return 'warn';
        const today = new Date().toISOString().split('T')[0];
        return s.dateDepart < today ? 'secondary' : 'info';
    }

    duree(arrivee: string, depart: string): number {
        const diff = new Date(depart).getTime() - new Date(arrivee).getTime();
        return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
    }
}
