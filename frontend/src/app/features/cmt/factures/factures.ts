import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PaiementService } from '@/app/core/services/paiement.service';
import { AuthService } from '@/app/core/services/auth.service';
import { CentreActifService } from '@/app/core/services/centre-actif.service';
import { Paiement } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-factures',
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, FormsModule, TableModule, TagModule, ButtonModule, TooltipModule, InputTextModule, ToastModule],
    template: `
        <p-toast />
        <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-extrabold text-slate-800">Reçus</h1>
                    <p class="text-sm text-slate-500 mt-1">Gestion des reçus et génération de documents.</p>
                </div>
                <p-button
                    label="Exporter Excel"
                    icon="pi pi-file-excel"
                    severity="success"
                    [outlined]="false"
                    pTooltip="Exporter tous les reçus en fichier Excel"
                    tooltipPosition="left"
                    (onClick)="exporterExcel()"
                    [loading]="exportLoading()" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <i class="pi pi-check-circle text-xl"></i>
                    </div>
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paiements enregistrés</span>
                        <span class="text-xl font-extrabold text-slate-800">{{ paiements().length }}</span>
                    </div>
                </div>
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <i class="pi pi-wallet text-xl"></i>
                    </div>
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total encaissé</span>
                        <span class="text-xl font-extrabold text-slate-800">{{ totalEncaisse() | number }} FCFA</span>
                    </div>
                </div>
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <i class="pi pi-file-pdf text-xl"></i>
                    </div>
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reçus PDF</span>
                        <span class="text-xl font-extrabold text-slate-800">{{ paiements().length }}</span>
                    </div>
                </div>
            </div>

            <div class="mb-4">
                <span class="p-input-icon-left w-full md:w-96 block">
                    <i class="pi pi-search"></i>
                    <input pInputText class="w-full" placeholder="Rechercher client, chambre…"
                        [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
                </span>
            </div>

            @if (loading()) {
                <div class="flex justify-center py-12"><i class="pi pi-spin pi-spinner text-3xl text-slate-400"></i></div>
            } @else {
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <p-table [value]="filteredPaiements()" [paginator]="true" [rows]="10" dataKey="id">
                        <ng-template #header>
                            <tr>
                                <th>Réf. reçu</th>
                                <th>Client</th>
                                <th>Chambre</th>
                                <th>Période</th>
                                <th>Montant</th>
                                <th>Date paiement</th>
                                <th>Mode</th>
                                <th>Actions</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-p>
                            <tr class="hover:bg-slate-50/50 transition-colors">
                                <td class="font-mono font-bold text-slate-700">#{{ p.id }}</td>
                                <td class="font-medium text-slate-700">{{ p.clientNom || '-' }}</td>
                                <td class="text-slate-600">{{ p.chambreNumero || '-' }}</td>
                                <td class="text-slate-500 text-sm whitespace-nowrap">
                                    @if (p.dateSortieReelle) {
                                        {{ p.dateSortieReelle | date:'dd/MM/yyyy' }}
                                    } @else { - }
                                </td>
                                <td class="font-bold text-slate-800">{{ p.montant | number }} FCFA</td>
                                <td class="text-slate-500 text-sm">{{ p.datePaiement | date:'dd/MM/yyyy' }}</td>
                                <td><span class="text-xs font-semibold text-slate-600">{{ p.modePaiement }}</span></td>
                                <td>
                                    <div class="flex gap-1">
                                        <p-button icon="pi pi-file-pdf" [rounded]="true" [text]="true"
                                            pTooltip="Télécharger reçu PDF" tooltipPosition="top"
                                            (onClick)="telechargerRecu(p.reservationId)" />
                                    </div>
                                </td>
                            </tr>
                        </ng-template>
                        <ng-template #emptymessage>
                            <tr><td colspan="8" class="text-center py-8 text-slate-400">Aucun reçu enregistré.</td></tr>
                        </ng-template>
                    </p-table>
                </div>
            }
        </div>
    `
})
export class Factures implements OnInit {
    private messageService = inject(MessageService);
    private paiementService = inject(PaiementService);
    private auth = inject(AuthService);
    private centreActif = inject(CentreActifService);

    paiements = signal<Paiement[]>([]);
    loading = signal(true);
    searchQuery = signal('');
    exportLoading = signal(false);

    filteredPaiements = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        if (!q) return this.paiements();
        return this.paiements().filter(p =>
            (p.clientNom || '').toLowerCase().includes(q) ||
            (p.chambreNumero || '').toLowerCase().includes(q) ||
            (String(p.id) || '').includes(q)
        );
    });

    totalEncaisse = computed(() => this.paiements().reduce((sum, p) => sum + (p.montant ?? 0), 0));

    ngOnInit() {
        const centreId = this.auth.user()?.centreId ?? this.centreActif.centreActif()?.id;
        if (centreId) {
            this.paiementService.getByCentre(centreId).subscribe({
                next: (list) => { this.paiements.set(list || []); this.loading.set(false); },
                error: () => this.loading.set(false)
            });
        } else {
            this.loading.set(false);
        }
    }

    telechargerRecu(reservationId: number) {
        this.paiementService.telechargerFacture(reservationId).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `recu-reservation-${reservationId}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de télécharger le reçu.' })
        });
    }

    exporterExcel() {
        const centreId = this.auth.user()?.centreId ?? this.centreActif.centreActif()?.id;
        if (!centreId) {
            this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Aucun centre sélectionné.' });
            return;
        }
        this.exportLoading.set(true);
        this.paiementService.exporterExcel(centreId).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `recus-centre-${centreId}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.exportLoading.set(false);
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Export Excel téléchargé avec succès.' });
            },
            error: () => {
                this.exportLoading.set(false);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Impossible d'exporter les reçus en Excel." });
            }
        });
    }
}
