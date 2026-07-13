import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ReservationService } from '@/app/core/services/reservation.service';
import { AuthService } from '@/app/core/services/auth.service';
import { CentreActifService } from '@/app/core/services/centre-actif.service';
import { NotificationService } from '@/app/core/services/notification.service';
import { Reservation } from '@/app/core/models/cmt.models';
import { isSejourEnregistre } from '@/app/core/utils/date.util';

@Component({
    selector: 'app-sejours',
    standalone: true,
    imports: [CommonModule, TableModule, TagModule],
    template: `
        <div class="card">
            <h2 class="text-2xl font-semibold mb-4">Gestion des séjours</h2>
            <p class="text-sm text-slate-500 mb-4">Séjours en cours et séjours passés (enregistrés).</p>

            @if (loading()) {
                <div class="flex justify-center py-12"><i class="pi pi-spin pi-spinner text-3xl text-slate-400"></i></div>
            } @else {
                <p-table [value]="reservations()" [paginator]="true" [rows]="10" dataKey="id">
                    <ng-template #header>
                        <tr>
                            <th>Réf.</th>
                            <th>Client</th>
                            <th>Chambre</th>
                            <th>Date arrivée</th>
                            <th>Date départ</th>
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
                            <td><p-tag [value]="statutLabel(r)" [severity]="severity(r)" /></td>
                        </tr>
                    </ng-template>
                    <ng-template #emptymessage>
                        <tr><td colspan="6" class="text-center py-8 text-slate-400">Aucun séjour en cours ou passé.</td></tr>
                    </ng-template>
                </p-table>
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
                this.reservations.set((list || []).filter(r => isSejourEnregistre(r.statut, r.dateArrivee)));
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    statutLabel(r: Reservation): string {
        if (r.payee) return 'Terminé';
        return 'En cours';
    }

    severity(r: Reservation): 'success' | 'warn' | 'danger' | 'info' {
        return r.payee ? 'success' : 'warn';
    }
}
