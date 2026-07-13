import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Chambre, StatutChambre } from '@/app/core/models/cmt.models';
import { AuthService } from '@/app/core/services/auth.service';
import { CentreActifService } from '@/app/core/services/centre-actif.service';
import { ChambreService } from '@/app/core/services/chambre.service';

@Component({
    selector: 'app-occupation',
    standalone: true,
    imports: [CommonModule, TableModule, TagModule, ButtonModule, CardModule],
    template: `
        <div class="card">
            <h2 class="text-2xl font-semibold mb-4">Occupation des chambres</h2>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <p-card>
                    <div class="text-center">
                        <span class="text-3xl font-bold text-green-600">{{ disponibles() }}</span>
                        <p class="text-sm text-slate-500 mt-1">Disponibles</p>
                    </div>
                </p-card>
                <p-card>
                    <div class="text-center">
                        <span class="text-3xl font-bold text-orange-500">{{ occupees() }}</span>
                        <p class="text-sm text-slate-500 mt-1">Occupées</p>
                    </div>
                </p-card>
                <p-card>
                    <div class="text-center">
                        <span class="text-3xl font-bold text-red-500">{{ maintenance() }}</span>
                        <p class="text-sm text-slate-500 mt-1">Maintenance</p>
                    </div>
                </p-card>
            </div>

            <p-table [value]="chambres()" [paginator]="true" [rows]="10" dataKey="id">
                <ng-template #header>
                    <tr>
                        <th>N° Chambre</th>
                        <th>Client</th>
                        <th>Date d'arrivée</th>
                        <th>Date départ prévue</th>
                        <th>Statut</th>
                    </tr>
                </ng-template>
                <ng-template #body let-ch>
                    <tr>
                        <td>{{ ch.numero }}</td>
                        <td>
                            @if (ch.statut === 'OCCUPEE') {
                                {{ ch.clientNom }}
                            } @else {
                                <span class="text-slate-400">—</span>
                            }
                        </td>
                        <td>
                            @if (ch.statut === 'OCCUPEE' && ch.dateArrivee) {
                                {{ ch.dateArrivee | date:'dd/MM/yyyy' }}
                            } @else {
                                <span class="text-slate-400">—</span>
                            }
                        </td>
                        <td>
                            @if (ch.statut === 'OCCUPEE' && ch.dateDepart) {
                                {{ ch.dateDepart | date:'dd/MM/yyyy' }}
                            } @else {
                                <span class="text-slate-400">—</span>
                            }
                        </td>
                        <td><p-tag [value]="statutLabel(ch.statut)" [severity]="severity(ch.statut)" /></td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class Occupation implements OnInit {
    private auth = inject(AuthService);
    private centreActif = inject(CentreActifService);
    private chambreService = inject(ChambreService);

    chambres = signal<Chambre[]>([]);
    disponibles = signal(0);
    occupees = signal(0);
    maintenance = signal(0);

    ngOnInit() {
        const centreId = this.auth.user()?.centreId ?? this.centreActif.centreActif()?.id;
        if (centreId) {
            this.chambreService.getByCentre(centreId).subscribe(list => {
                this.chambres.set(list);
                this.disponibles.set(list.filter(c => c.statut === 'DISPONIBLE').length);
                this.occupees.set(list.filter(c => c.statut === 'OCCUPEE').length);
                this.maintenance.set(list.filter(c => c.statut === 'MAINTENANCE').length);
            });
        }
    }

    statutLabel(s: StatutChambre): string {
        const m: Record<StatutChambre, string> = {
            DISPONIBLE: 'Disponible',
            OCCUPEE: 'Occupée',
            MAINTENANCE: 'Maintenance'
        };
        return m[s] ?? s;
    }

    severity(s: StatutChambre): 'success' | 'warn' | 'danger' {
        return s === 'DISPONIBLE' ? 'success' : s === 'OCCUPEE' ? 'warn' : 'danger';
    }
}
