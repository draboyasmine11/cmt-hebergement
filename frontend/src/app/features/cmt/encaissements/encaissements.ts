import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { PaiementService } from '@/app/core/services/paiement.service';
import { ReservationService } from '@/app/core/services/reservation.service';
import { AuthService } from '@/app/core/services/auth.service';
import { CentreActifService } from '@/app/core/services/centre-actif.service';
import { NotificationService } from '@/app/core/services/notification.service';
import { Paiement, Reservation, ModePaiement } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-encaissements',
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, FormsModule, TableModule, TagModule, ButtonModule, CardModule, DialogModule, InputNumberModule, ToastModule, SelectModule, TooltipModule],
    template: `
        <p-toast />
        <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-extrabold text-slate-800">Encaissements</h1>
                    <p class="text-sm text-slate-500 mt-1">Gestion des encaissements et paiements.</p>
                </div>
                <button (click)="openDialog()" pTooltip="Enregistrer un nouvel encaissement" tooltipPosition="left" class="flex items-center gap-2 px-4 py-2.5 bg-[#00529B] hover:bg-[#00407a] text-white rounded-xl text-sm font-bold cursor-pointer">
                    <i class="pi pi-wallet"></i> Nouvel encaissement
                </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <p-card>
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <i class="pi pi-wallet text-xl"></i>
                        </div>
                        <div>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total encaissé</span>
                            <span class="text-xl font-extrabold text-slate-800">{{ totalEncaisse() | number }} FCFA</span>
                        </div>
                    </div>
                </p-card>
                <p-card>
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <i class="pi pi-list text-xl"></i>
                        </div>
                        <div>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Encaissements</span>
                            <span class="text-xl font-extrabold text-slate-800">{{ encaissements().length }}</span>
                        </div>
                    </div>
                </p-card>
                <p-card>
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <i class="pi pi-chart-line text-xl"></i>
                        </div>
                        <div>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Montant moyen</span>
                            <span class="text-xl font-extrabold text-slate-800">{{ moyennePaiement() | number }} FCFA</span>
                        </div>
                    </div>
                </p-card>
                <p-card>
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <i class="pi pi-file text-xl"></i>
                        </div>
                        <div>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Factures émises</span>
                            <span class="text-xl font-extrabold text-slate-800">{{ encaissements().length }}</span>
                        </div>
                    </div>
                </p-card>
            </div>

            <div class="mb-4">
                <span class="p-input-icon-left w-full md:w-96 block">
                    <i class="pi pi-search"></i>
                    <input pInputText class="w-full" placeholder="Rechercher client, chambre, mode de paiement…" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
                </span>
            </div>

            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <p-table [value]="filtresEncaissements()" [paginator]="true" [rows]="10">
                    <ng-template #header>
                        <tr>
                            <th>ID</th>
                            <th>Client</th>
                            <th>Chambre</th>
                            <th>Montant</th>
                            <th>Mode paiement</th>
                            <th>Date paie.</th>
                            <th>Sortie réelle</th>
                            <th>Statut</th>
                            <th>Facture</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-e>
                        <tr>
                            <td class="font-medium">{{ e.id }}</td>
                            <td>{{ e.clientNom }}</td>
                            <td>{{ e.chambreNumero }}</td>
                            <td class="font-bold text-slate-800">{{ e.montant | number }} FCFA</td>
                            <td>
                                <p-tag [value]="modeLabel(e.modePaiement)" [severity]="tagSeverity(e.modePaiement)" />
                            </td>
                            <td>{{ e.datePaiement | date:'dd/MM/yyyy HH:mm' }}</td>
                            <td>{{ e.dateSortieReelle ? (e.dateSortieReelle | date:'dd/MM/yyyy') : '-' }}</td>
                            <td>
                                <p-tag value="Payé" severity="success" />
                            </td>
                            <td>
                                <p-button icon="pi pi-file-pdf" [rounded]="true" [text]="true" (onClick)="voirFacture(e)" pTooltip="Télécharger la facture PDF" tooltipPosition="top" />
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template #emptymessage>
                        <tr><td colspan="9" class="text-center py-8 text-slate-400">Aucun encaissement enregistré</td></tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <p-dialog [(visible)]="dialogVisible" header="Nouvel encaissement" [modal]="true" [style]="{ width: '500px' }">
            <div class="flex flex-col gap-4 pt-2">
                <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold text-slate-700">Réservation</label>
                    <p-select [options]="reservationsPayables()" [(ngModel)]="selectedReservationId" optionLabel="label" optionValue="value"
                        placeholder="Sélectionner une réservation validée" class="w-full" appendTo="body" (onChange)="onReservationChange()" />
                </div>
                @if (reservationCourante) {
                    <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-500">
                        Arrivée : <span class="font-semibold text-slate-700">{{ reservationCourante.dateArrivee }}</span>
                        &nbsp;|&nbsp; Déprévu : <span class="font-semibold text-slate-700">{{ reservationCourante.dateDepart }}</span>
                    </div>
                }
                <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold text-slate-700">Date de sortie réelle</label>
                    <input type="date" [ngModel]="dateSortieSaisie" (ngModelChange)="onDateSortieChange($event)"
                        class="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20 bg-white" />
                    @if (avertissementSortie) {
                        <div class="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-1">
                            <i class="pi pi-exclamation-triangle text-amber-500 text-sm"></i>
                            <span class="text-xs text-amber-700 font-medium">La date de sortie réelle dépasse la date de départ prévue. Le montant sera recalculé en conséquence.</span>
                        </div>
                    }
                </div>
                <div class="bg-blue-50 rounded-xl p-3 border border-blue-100 flex items-center justify-between">
                    <span class="text-sm font-semibold text-slate-700">Total à payer</span>
                    <span class="text-xl font-extrabold text-[#00529B]">{{ montantCalcule | number }} FCFA</span>
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold text-slate-700">Mode de paiement</label>
                    <p-select [options]="modesPaiement()" [(ngModel)]="modePaiement" optionLabel="label" optionValue="value"
                        placeholder="Choisir un mode" class="w-full" appendTo="body" />
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold text-slate-700">Référence (optionnel)</label>
                    <input pInputText class="w-full" [(ngModel)]="reference" placeholder="N° chèque, transaction…" />
                </div>
            </div>
            <ng-template #footer>
                <p-button label="Annuler" [text]="true" (onClick)="dialogVisible = false" pTooltip="Fermer sans enregistrer" tooltipPosition="top" />
                <p-button label="Encaisser" (onClick)="save()" pTooltip="Enregistrer le paiement" tooltipPosition="top" />
            </ng-template>
        </p-dialog>
    `
})
export class Encaissements implements OnInit {
    private paiementService = inject(PaiementService);
    private reservationService = inject(ReservationService);
    private authService = inject(AuthService);
    private centreActif = inject(CentreActifService);
    private messageService = inject(MessageService);
    private notificationService = inject(NotificationService);
    private router = inject(Router);

    encaissements = signal<Paiement[]>([]);
    reservations = signal<Reservation[]>([]);
    searchQuery = signal('');
    dialogVisible = false;

    selectedReservationId?: number;
    modePaiement?: ModePaiement;
    reference = '';
    dateSortieSaisie = '';
    avertissementSortie = false;
    montantCalcule = 0;
    reservationCourante: Reservation | null = null;

    centreId = computed(() => this.authService.user()?.centreId ?? this.centreActif.centreActif()?.id);

    reservationsPayables = computed(() =>
        this.reservations()
            .filter(r => r.statut === 'VALIDEE' && !r.payee)
            .map(r => ({
                label: `#${r.id} - ${r.utilisateurNom} - Ch. ${r.chambreNumero}`,
                value: r.id,
                reservation: r,
            }))
    );

    modesPaiement = signal<{ label: string; value: ModePaiement }[]>([
        { label: 'Espèces', value: 'ESPECES' },
        { label: 'Orange Money', value: 'ORANGE_MONEY' },
        { label: 'Moov Money', value: 'MOOV_MONEY' },
        { label: 'Chèque', value: 'CHEQUE' },
    ]);

    filtresEncaissements = computed(() => {
        const list = this.encaissements();
        const q = this.searchQuery().toLowerCase().trim();
        if (!q) return list;
        return list.filter(e =>
            (e.clientNom || '').toLowerCase().includes(q) ||
            (e.chambreNumero || '').toLowerCase().includes(q) ||
            (e.modePaiement || '').toLowerCase().includes(q)
        );
    });

    ngOnInit() {
        this.charger();
        this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.charger());
        this.notificationService.reservationUpdated$.subscribe(() => this.charger());
    }

    private charger() {
        const cid = this.centreId();
        if (!cid) return;
        this.paiementService.getByCentre(cid).subscribe(p => this.encaissements.set(p));
        this.reservationService.getByCentre(cid).subscribe(r => this.reservations.set(r));
    }

    openDialog() {
        this.selectedReservationId = undefined;
        this.modePaiement = undefined;
        this.reference = '';
        this.dateSortieSaisie = '';
        this.montantCalcule = 0;
        this.reservationCourante = null;
        this.dialogVisible = true;
    }

    onReservationChange() {
        const found = this.reservationsPayables().find(r => r.value === this.selectedReservationId);
        this.reservationCourante = found?.reservation ?? null;
        this.avertissementSortie = false;
        if (this.reservationCourante) {
            this.dateSortieSaisie = this.reservationCourante.dateDepart;
            this.calculerMontant();
        } else {
            this.dateSortieSaisie = '';
            this.montantCalcule = 0;
        }
    }

    onDateSortieChange(val: string) {
        this.dateSortieSaisie = val;
        this.avertissementSortie = !!(this.reservationCourante && val && val > this.reservationCourante.dateDepart);
        this.calculerMontant();
    }

    private calculerMontant() {
        const r = this.reservationCourante;
        if (!r || !this.dateSortieSaisie) { this.montantCalcule = 0; return; }
        const arrivee = new Date(r.dateArrivee);
        const sortie = new Date(this.dateSortieSaisie);
        let nuits = Math.ceil((sortie.getTime() - arrivee.getTime()) / (1000 * 60 * 60 * 24));
        if (nuits < 1) nuits = 1;
        const nuitsPlan = Math.ceil((new Date(r.dateDepart).getTime() - new Date(r.dateArrivee).getTime()) / (1000 * 60 * 60 * 24)) || 1;
        const prixNuit = (r.montantTotal ?? 0) / nuitsPlan;
        this.montantCalcule = Math.round(prixNuit * nuits);
    }

    save() {
        if (!this.selectedReservationId || !this.modePaiement) return;
        this.paiementService.enregistrer({
            montant: this.montantCalcule,
            modePaiement: this.modePaiement,
            reference: this.reference || undefined,
            reservationId: this.selectedReservationId,
            dateSortieReelle: this.dateSortieSaisie || undefined,
        }).subscribe({
            next: () => {
                this.dialogVisible = false;
                this.charger();
                this.notificationService.triggerReservationRefresh();
                this.messageService.add({ severity: 'success', summary: 'Encaissement effectué', detail: 'Paiement enregistré avec succès.' });
            },
            error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: e.error?.message })
        });
    }

    voirFacture(e: Paiement) {
        this.paiementService.telechargerFacture(e.reservationId).subscribe(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `facture-${e.reservationId}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    totalEncaisse() { return this.encaissements().reduce((s, e) => s + e.montant, 0); }

    moyennePaiement() {
        const list = this.encaissements();
        return list.length ? Math.round(list.reduce((s, e) => s + e.montant, 0) / list.length) : 0;
    }

    modeLabel(m: ModePaiement): string {
        const map: Record<string, string> = { ESPECES: 'Espèces', ORANGE_MONEY: 'Orange Money', MOOV_MONEY: 'Moov Money', CHEQUE: 'Chèque' };
        return map[m] ?? m;
    }

    tagSeverity(m: ModePaiement): 'success' | 'info' | 'warn' | 'contrast' {
        switch (m) {
            case 'ESPECES': return 'success';
            case 'ORANGE_MONEY': return 'warn';
            case 'MOOV_MONEY': return 'info';
            case 'CHEQUE': return 'contrast';
            default: return 'info';
        }
    }
}
