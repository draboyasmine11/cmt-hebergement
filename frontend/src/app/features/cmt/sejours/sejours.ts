import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ReservationService } from '@/app/core/services/reservation.service';
import { AuthService } from '@/app/core/services/auth.service';
import { CentreActifService } from '@/app/core/services/centre-actif.service';
import { NotificationService } from '@/app/core/services/notification.service';
import { Reservation } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-sejours',
    standalone: true,
    imports: [CommonModule, TableModule, TagModule, ButtonModule, TooltipModule],
    template: `
        <div class="flex flex-col gap-6">
            <div>
                <h2 class="text-2xl font-extrabold text-slate-800">Gestion des séjours</h2>
                <p class="text-sm text-slate-500 mt-1">Tous les séjours du centre d'hébergement.</p>
            </div>

            @if (loading()) {
                <div class="flex justify-center py-12"><i class="pi pi-spin pi-spinner text-3xl text-slate-400"></i></div>
            } @else {
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <p-table [value]="reservations()" [paginator]="true" [rows]="10" dataKey="id">
                        <ng-template #header>
                            <tr>
                                <th>Réf.</th>
                                <th>Client</th>
                                <th>Chambre</th>
                                <th>Arrivée</th>
                                <th>Départ</th>
                                <th>Montant</th>
                                <th>Statut</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-r>
                            <tr>
                                <td class="font-bold text-primary">#{{ r.id }}</td>
                                <td>{{ r.utilisateurNom || '-' }}</td>
                                <td>{{ r.chambreNumero || '-' }}</td>
                                <td>{{ r.dateArrivee | date:'dd/MM/yyyy' }}</td>
                                <td>{{ r.dateDepart | date:'dd/MM/yyyy' }}</td>
                                <td class="font-semibold text-slate-800">{{ r.montantTotal | number }} FCFA</td>
                                <td><p-tag [value]="statutLabel(r)" [severity]="severity(r)" /></td>
                            </tr>
                        </ng-template>
                        <ng-template #emptymessage>
                            <tr><td colspan="7" class="text-center py-8 text-slate-400">Aucun séjour trouvé pour ce centre.</td></tr>
                        </ng-template>
                    </p-table>
                </div>
            }
        </div>
    `
})
export class Sejours implements OnInit {
    private router = inject(Router);
    private reservationService = inject(ReservationService);
    private auth = inject(AuthService);
    private centreActif = inject(CentreActifService);
    private notificationService = inject(NotificationService);

    reservations = signal<Reservation[]>([]);
    loading = signal(true);

    ngOnInit() {
        this.charger();
        this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.charger());
        this.notificationService.reservationUpdated$.subscribe(() => this.charger());
    }

    private charger() {
        const centreId = this.auth.user()?.centreId ?? this.centreActif.centreActif()?.id;
        if (!centreId) {
            this.loading.set(false);
            return;
        }
        this.loading.set(true);
        this.reservationService.getByCentre(centreId).subscribe({
            next: (list) => {
                this.reservations.set(list || []);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    statutLabel(r: Reservation): string {
        if (r.statut === 'EN_ATTENTE') return 'En attente';
        if (r.statut === 'VALIDEE' && r.payee) return 'Terminé';
        if (r.statut === 'VALIDEE') return 'En cours';
        if (r.statut === 'REFUSEE') return 'Refusé';
        if (r.statut === 'ANNULEE') return 'Annulé';
        return r.statut || '-';
    }

    severity(r: Reservation): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' {
        if (r.statut === 'EN_ATTENTE') return 'warn';
        if (r.statut === 'VALIDEE' && r.payee) return 'success';
        if (r.statut === 'VALIDEE') return 'info';
        if (r.statut === 'REFUSEE') return 'danger';
        if (r.statut === 'ANNULEE') return 'secondary';
        return 'info';
    }
}
