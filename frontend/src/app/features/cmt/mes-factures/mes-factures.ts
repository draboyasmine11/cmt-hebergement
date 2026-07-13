import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { PaiementService } from '@/app/core/services/paiement.service';
import { Paiement } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-mes-factures',
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, TableModule, TagModule, ButtonModule, CardModule, DialogModule, ToastModule, TooltipModule],
    template: `
        <p-toast />
        <div class="card">
            <h2 class="text-2xl font-semibold mb-4">Mes factures</h2>

            <div class="grid grid-cols-12 gap-4 mb-4">
                <div class="col-span-12 sm:col-span-6">
                    <p-card>
                        <div class="text-center">
                            <p class="text-sm text-slate-500">Total factures</p>
                            <p class="text-3xl font-bold text-[#00529B]">{{ totalFactures() }}</p>
                        </div>
                    </p-card>
                </div>
                <div class="col-span-12 sm:col-span-6">
                    <p-card>
                        <div class="text-center">
                            <p class="text-sm text-slate-500">Montant total</p>
                            <p class="text-3xl font-bold text-[#00529B]">{{ montantTotal() | number }} FCFA</p>
                        </div>
                    </p-card>
                </div>
            </div>

            @if (factures().length === 0) {
                <div class="text-center py-8 text-slate-400">
                    <i class="pi pi-file-pdf text-5xl mb-3 block"></i>
                    <p class="text-lg">Aucune facture trouvée</p>
                    <p class="text-sm">Vous n'avez aucune facture pour le moment.</p>
                </div>
            } @else {
                <p-table [value]="factures()" [paginator]="true" [rows]="10" dataKey="id">
                    <ng-template #header>
                        <tr>
                            <th>ID</th>
                            <th>Période</th>
                            <th>Chambre</th>
                            <th>Montant</th>
                            <th>Date</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-f>
                        <tr>
                            <td>{{ f.id }}</td>
                            <td>{{ f.periode }}</td>
                            <td>{{ f.chambreNumero }}</td>
                            <td>{{ f.montant | number }} FCFA</td>
                            <td>{{ f.datePaiement }}</td>
                            <td><p-tag value="Payée" severity="success" /></td>
                            <td>
                                <div class="flex gap-1 flex-wrap items-center">
                                    <p-button label="Voir" icon="pi pi-eye" size="small" [text]="true" (onClick)="voirDetail(f)" pTooltip="Voir les détails de cette facture" tooltipPosition="top" />
                                    <p-button label="Télécharger" icon="pi pi-download" size="small" [text]="true" severity="success" (onClick)="telechargerFacture(f)" pTooltip="Télécharger la facture en PDF" tooltipPosition="top" />
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            }
        </div>

        <p-dialog [(visible)]="dialogVisible" header="Détails de la facture" [modal]="true" [style]="{width: '450px'}">
            @if (factureSelectionnee()) {
                <div class="flex flex-col gap-3 pt-2">
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-sm text-slate-500">Facture #{{ factureSelectionnee()!.id }}</span>
                            <p-tag value="Payée" severity="success" />
                        </div>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-slate-500">Période</span>
                                <span class="font-semibold">{{ factureSelectionnee()!.periode }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-500">Chambre</span>
                                <span class="font-semibold">{{ factureSelectionnee()!.chambreNumero }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-500">Date d'émission</span>
                                <span class="font-semibold">{{ factureSelectionnee()!.datePaiement }}</span>
                            </div>
                            <div class="flex justify-between pt-2 border-t border-slate-200">
                                <span class="text-slate-500">Montant</span>
                                <span class="text-xl font-extrabold text-[#00529B]">{{ factureSelectionnee()!.montant | number }} FCFA</span>
                            </div>
                        </div>
                    </div>
                </div>
            }
            <ng-template #footer>
                <p-button label="Fermer" [text]="true" (onClick)="dialogVisible = false" pTooltip="Fermer cette fenêtre" tooltipPosition="top" />
                <p-button label="Télécharger le PDF" icon="pi pi-download" severity="success" (onClick)="telechargerFacture(factureSelectionnee()!)" pTooltip="Télécharger la facture en PDF" tooltipPosition="top" />
            </ng-template>
        </p-dialog>
    `
})
export class MesFactures implements OnInit {
    private paiementService = inject(PaiementService);
    private messageService = inject(MessageService);

    factures = signal<any[]>([]);
    dialogVisible = false;
    factureSelectionnee = signal<any | null>(null);

    totalFactures = computed(() => this.factures().length);
    montantTotal = computed(() => this.factures().reduce((sum, f) => sum + f.montant, 0));

    ngOnInit() {
        this.paiementService.getMesPaiements().subscribe((paiements) => {
            const mapped = (paiements || []).map((p: any) => ({
                ...p,
                periode: this.formaterPeriode(p.datePaiement),
                datePaiement: this.formaterDate(p.datePaiement)
            }));
            this.factures.set(mapped);
        });
    }

    private formaterPeriode(dateStr: string): string {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        } catch {
            return dateStr;
        }
    }

    private formaterDate(dateStr: string): string {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return dateStr;
        }
    }

    voirDetail(f: any) {
        this.factureSelectionnee.set(f);
        this.dialogVisible = true;
    }

    telechargerFacture(f: any) {
        this.paiementService.telechargerFacture(f.reservationId).subscribe((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `facture-${f.id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }
}
