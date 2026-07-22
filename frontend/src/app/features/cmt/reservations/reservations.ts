import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { ReservationService } from '@/app/core/services/reservation.service';
import { PaiementService } from '@/app/core/services/paiement.service';
import { AuthService } from '@/app/core/services/auth.service';
import { CentreActifService } from '@/app/core/services/centre-actif.service';
import { NotificationService } from '@/app/core/services/notification.service';
import { ModePaiement, Reservation, StatutReservation } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-reservations',
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, RouterModule, FormsModule, InputTextModule, SelectModule, TableModule, ButtonModule, TagModule, ToastModule, DialogModule, ToolbarModule, IconFieldModule, InputIconModule, TooltipModule],
    template: `
        <p-toast />
        <div class="card">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-semibold m-0">
                    {{ auth.isClient() ? 'Mes réservations' : 'Gestion des réservations' }}
                </h2>
            </div>
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    <p-iconfield iconPosition="left">
                        <p-inputicon class="pi pi-search" />
                        <input pInputText placeholder="Rechercher client, chambre…" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
                    </p-iconfield>
                </ng-template>
                <ng-template #end>
                    @if (!auth.isClient()) {
                        <p-select [options]="statutFiltres" [ngModel]="statutFilter()" (ngModelChange)="statutFilter.set($event)" optionLabel="label" optionValue="value"
                            class="w-full sm:w-48" placeholder="Filtrer par statut" appendTo="body" [showClear]="true" />
                    }
                </ng-template>
            </p-toolbar>
            <p-table [value]="filteredReservations()" [paginator]="true" [rows]="10" dataKey="id">
                <ng-template #header>
                    <tr>
                        <th>Date</th><th>Client</th><th>Chambre</th><th>Centre</th>
                        <th>Arrivée</th><th>Départ</th><th>Montant</th><th>Statut</th><th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-r>
                    <tr>
                        <td>{{ r.dateReservation | date:'dd/MM/yyyy' }}</td>
                        <td>{{ r.utilisateurNom }}</td>
                        <td>{{ r.chambreNumero }}</td>
                        <td>{{ r.centreNom }}</td>
                        <td>{{ r.dateArrivee }}</td>
                        <td>{{ r.dateDepart }}</td>
                        <td>{{ r.montantTotal | number }} FCFA</td>
                        <td>
                            <div class="flex flex-col gap-1">
                                <p-tag [value]="statutLabel(r.statut)" [severity]="severity(r.statut)" />
                                @if (r.statut === 'REFUSEE' && r.motifRejet) {
                                    <span class="text-xs text-red-500 italic">Motif : {{ r.motifRejet }}</span>
                                }
                            </div>
                        </td>
                        <td>
                            <div class="flex gap-1 flex-wrap items-center">
                                @if (auth.isAdmin() || auth.isGerant()) {
                                    @if (r.statut === 'EN_ATTENTE') {
                                        <p-button label="Valider" icon="pi pi-check" severity="success" size="small" (onClick)="ouvrirValidation(r)" pTooltip="Valider la réservation" tooltipPosition="top" />
                                        <p-button label="Refuser" icon="pi pi-times" severity="danger" size="small" (onClick)="ouvrirRefus(r)" pTooltip="Refuser la réservation" tooltipPosition="top" />
                                    }
                                    @if (r.statut === 'VALIDEE') {
                                        @if (!r.payee && (auth.isGerant() || auth.isAdmin())) {
                                            <p-button label="Arrêter le séjour" icon="pi pi-stop" size="small" severity="warn" (onClick)="ouvrirPaiement(r)" pTooltip="Enregistrer le paiement et clôturer le séjour" tooltipPosition="top" />
                                        }
                                        @if (r.payee) {
                                            <p-button label="Reçu" icon="pi pi-file-pdf" size="small" (onClick)="recu(r)" pTooltip="Télécharger le reçu PDF" tooltipPosition="top" />
                                        }
                                    }
                                    @if (r.statut === 'REFUSEE' || r.statut === 'ANNULEE') {
                                        <span class="text-xs text-slate-400 italic">Aucune action</span>
                                    }
                                }
                                @if (auth.isClient()) {
                                    @if (r.payee) {
                                        <p-button icon="pi pi-file-pdf" size="small" [text]="true" (onClick)="recu(r)" pTooltip="Télécharger mon reçu PDF" tooltipPosition="top" />
                                    }
                                    @if ((r.statut === 'EN_ATTENTE' || r.statut === 'VALIDEE') && r.dateArrivee >= today) {
                                        <p-button icon="pi pi-ban" severity="warn" [rounded]="true" [text]="true" (onClick)="annuler(r)" pTooltip="Annuler ma réservation" tooltipPosition="top" />
                                    }
                                }
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialogPaiement" header="Enregistrer un encaissement" [modal]="true" [style]="{width: '480px'}">
            @if (resSelectionnee()) {
                <div class="flex flex-col gap-4 pt-2">
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p class="text-sm text-slate-500">Chambre <strong class="text-slate-800">{{ resSelectionnee()!.chambreNumero }}</strong> — {{ resSelectionnee()!.centreNom }}</p>
                        <p class="text-xs text-slate-400 mt-2">Arrivée : <span class="font-semibold text-slate-700">{{ resSelectionnee()!.dateArrivee }}</span> &nbsp;|&nbsp; Départ prévu : <span class="font-semibold text-slate-700">{{ resSelectionnee()!.dateDepart }}</span></p>
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-semibold text-slate-700">Date de sortie réelle</label>
                        <input type="date" [ngModel]="dateSortieReelle" (ngModelChange)="onDateSortieChange($event)"
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
                        <select [(ngModel)]="modePaiement"
                            class="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20 bg-white">
                            <optgroup label="Espèces &amp; Chèque">
                                <option value="ESPECES">💵 Espèces (paiement sur place)</option>
                                <option value="CHEQUE">✍️ Chèque</option>
                            </optgroup>
                            <optgroup label="Mobile Money">
                                <option value="ORANGE_MONEY">🟠 Orange Money</option>
                                <option value="MOOV_MONEY">🔵 Moov Money</option>
                                <option value="TELECEL_MONEY">🟣 Telecel Money</option>
                                <option value="WAVE">🟡 Wave</option>
                            </optgroup>
                        </select>
                    </div>
                    @if (isMobileMoney()) {
                        <div class="flex flex-col gap-1">
                            <label class="text-sm font-semibold text-slate-700">Numéro Mobile Money</label>
                            <input type="tel" [(ngModel)]="telephone" placeholder="Ex: 70 00 00 00"
                                class="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20 bg-slate-50" />
                        </div>
                    }
                    @if (modePaiement === 'CHEQUE') {
                        <div class="flex flex-col gap-3">
                            <div class="flex flex-col gap-1">
                                <label class="text-sm font-semibold text-slate-700">Référence du chèque <span class="text-red-500">*</span></label>
                                <input type="text" [(ngModel)]="referenceCheque" placeholder="Ex: CHQ-1234567"
                                    class="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20 bg-slate-50" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-sm font-semibold text-slate-700">Nom de la banque émettrice</label>
                                <input type="text" [(ngModel)]="nomBanque" placeholder="Ex: Coris Bank, BOA, Ecobank..."
                                    class="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20 bg-slate-50" />
                            </div>
                        </div>
                    }
                </div>
                <ng-template #footer>
                    <p-button label="Annuler" [text]="true" (onClick)="dialogPaiement = false" pTooltip="Fermer sans enregistrer" tooltipPosition="top" />
                    <p-button label="Confirmer le paiement" icon="pi pi-check" (onClick)="confirmerPaiement()" pTooltip="Valider et enregistrer le paiement" tooltipPosition="top" />
                </ng-template>
            }
        </p-dialog>

        <p-dialog [(visible)]="dialogValidation" header="Confirmer la validation" [modal]="true" [style]="{width: '420px'}">
            @if (resValidation()) {
                <div class="flex flex-col gap-4 pt-2">
                    <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center gap-3">
                        <i class="pi pi-check-circle text-emerald-600 text-xl"></i>
                        <p class="text-sm text-emerald-800 font-semibold">Voulez-vous valider la réservation de <strong>{{ resValidation()!.utilisateurNom }}</strong> ?</p>
                    </div>
                    <div class="text-xs text-slate-500 space-y-1">
                        <p><span class="font-semibold text-slate-700">Chambre :</span> {{ resValidation()!.chambreNumero }}</p>
                        <p><span class="font-semibold text-slate-700">Arrivée :</span> {{ resValidation()!.dateArrivee }} &nbsp;|&nbsp; <span class="font-semibold text-slate-700">Départ :</span> {{ resValidation()!.dateDepart }}</p>
                        <p><span class="font-semibold text-slate-700">Montant :</span> {{ resValidation()!.montantTotal | number }} FCFA</p>
                    </div>
                </div>
                <ng-template #footer>
                    <p-button label="Annuler" [text]="true" (onClick)="dialogValidation = false" pTooltip="Fermer sans valider" tooltipPosition="top" />
                    <p-button label="Confirmer la validation" icon="pi pi-check" severity="success" (onClick)="valider()" pTooltip="Confirmer la validation de cette réservation" tooltipPosition="top" />
                </ng-template>
            }
        </p-dialog>

        <p-dialog [(visible)]="dialogRefus" header="Refuser la réservation" [modal]="true" [style]="{width: '420px'}">
            @if (resRefus()) {
                <div class="flex flex-col gap-4 pt-2">
                    <div class="bg-red-50 rounded-xl p-4 border border-red-100 flex items-center gap-3">
                        <i class="pi pi-times-circle text-red-600 text-xl"></i>
                        <p class="text-sm text-red-800 font-semibold">Refuser la réservation de <strong>{{ resRefus()!.utilisateurNom }}</strong></p>
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-semibold text-slate-700">Motif de refus <span class="text-red-500">*</span></label>
                        <textarea [(ngModel)]="motifRefus" rows="4" required placeholder="Expliquez le motif du refus..."
                            class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"></textarea>
                        @if (motifRefusSubmitted && !motifRefus.trim()) {
                            <p class="text-xs text-red-500 mt-1">Le motif de refus est obligatoire.</p>
                        }
                    </div>
                </div>
                <ng-template #footer>
                    <p-button label="Annuler" [text]="true" (onClick)="dialogRefus = false" pTooltip="Fermer sans refuser" tooltipPosition="top" />
                    <p-button label="Confirmer le refus" icon="pi pi-times" severity="danger" (onClick)="refuser()" pTooltip="Confirmer le refus de cette réservation" tooltipPosition="top" />
                </ng-template>
            }
        </p-dialog>
    `
})
export class Reservations implements OnInit {
    auth = inject(AuthService);
    private centreActif = inject(CentreActifService);
    private reservationService = inject(ReservationService);
    private paiementService = inject(PaiementService);
    private messageService = inject(MessageService);
    private notificationService = inject(NotificationService);
    private router = inject(Router);

    reservations = signal<Reservation[]>([]);
    dialogPaiement = false;
    dialogValidation = false;
    dialogRefus = false;
    resSelectionnee = signal<Reservation | null>(null);
    resValidation = signal<Reservation | null>(null);
    resRefus = signal<Reservation | null>(null);
    motifRefus = '';
    motifRefusSubmitted = false;
    avertissementSortie = false;
    modePaiement: ModePaiement = 'ESPECES';
    telephone = '';
    referenceCheque = '';
    nomBanque = '';
    dateSortieReelle = '';
    montantCalcule = 0;
    searchQuery = signal('');
    statutFilter = signal<string | null>(null);
    statutFiltres = [
        { label: 'Tous', value: null },
        { label: 'En attente', value: 'EN_ATTENTE' },
        { label: 'Validée', value: 'VALIDEE' },
        { label: 'Refusée', value: 'REFUSEE' },
        { label: 'Annulée', value: 'ANNULEE' }
    ];

    get today(): string {
        return new Date().toISOString().split('T')[0];
    }

    filteredReservations = computed(() => {
        let list = this.reservations();
        const q = this.searchQuery().toLowerCase().trim();
        if (q) {
            list = list.filter(r =>
                (r.utilisateurNom || '').toLowerCase().includes(q) ||
                (r.chambreNumero || '').toLowerCase().includes(q) ||
                (r.centreNom || '').toLowerCase().includes(q)
            );
        }
        const sf = this.statutFilter();
        if (sf) {
            list = list.filter(r => r.statut === sf);
        }
        return list;
    });

    isMobileMoney() {
        return ['ORANGE_MONEY', 'MOOV_MONEY', 'WAVE', 'TELECEL_MONEY'].includes(this.modePaiement);
    }

    ngOnInit() {
        this.load();
        // Effacer le badge du menu dès la visite de la page
        this.notificationService.markReservationPageVisited();
        this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
            this.load();
            this.notificationService.markReservationPageVisited();
        });
    }

    private notifyChange() {
        this.notificationService.triggerReservationRefresh();
    }

    load() {
        let obs;
        if (this.auth.isClient()) {
            obs = this.reservationService.getMesReservations();
        } else if (this.auth.isGerant()) {
            // Priorité : centreId du JWT (user signal) puis du service centre actif
            const rawId = this.auth.user()?.centreId ?? this.centreActif.centreActif()?.id;
            const centreId = rawId !== undefined && rawId !== null ? Number(rawId) : NaN;
            if (Number.isInteger(centreId) && centreId > 0) {
                obs = this.reservationService.getByCentre(centreId);
            } else {
                // Fallback : charger d'abord les centres puis recharger
                this.centreActif.loadCentres();
                this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Centre non configuré. Contactez un administrateur.' });
                obs = this.reservationService.getAll();
            }
        } else {
            obs = this.reservationService.getAll();
        }
        obs.subscribe({
            next: (data) => this.reservations.set(data),
            error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les réservations.' })
        });
    }

    statutLabel(s: StatutReservation): string {
        const m: Record<StatutReservation, string> = {
            EN_ATTENTE: 'En attente', VALIDEE: 'Validée', REFUSEE: 'Refusée', ANNULEE: 'Annulée'
        };
        return m[s] ?? s;
    }

    severity(s: StatutReservation): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const map: Record<StatutReservation, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
            EN_ATTENTE: 'warn', VALIDEE: 'success', REFUSEE: 'danger', ANNULEE: 'secondary'
        };
        return map[s];
    }

    ouvrirValidation(r: Reservation) {
        this.resValidation.set(r);
        this.dialogValidation = true;
    }

    valider() {
        const r = this.resValidation();
        if (!r) return;
        this.reservationService.valider(r.id).subscribe({
            next: () => { this.dialogValidation = false; this.load(); this.notifyChange(); this.messageService.add({ severity: 'success', summary: 'Réservation validée', detail: `La réservation de ${r.utilisateurNom} a été validée.` }); },
            error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: e.error?.message || 'Une erreur est survenue.' })
        });
    }

    annuler(r: Reservation) {
        if (!confirm('Voulez-vous annuler cette réservation ?')) return;
        this.reservationService.annuler(r.id).subscribe({
            next: () => { this.load(); this.notifyChange(); this.messageService.add({ severity: 'success', summary: 'Réservation annulée', detail: `La réservation de ${r.utilisateurNom} a été annulée.` }); },
            error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: e.error?.message || 'Une erreur est survenue.' })
        });
    }

    ouvrirRefus(r: Reservation) {
        this.resRefus.set(r);
        this.motifRefus = '';
        this.motifRefusSubmitted = false;
        this.dialogRefus = true;
    }

    refuser() {
        const r = this.resRefus();
        if (!r) return;
        this.motifRefusSubmitted = true;
        if (!this.motifRefus.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Motif requis', detail: 'Veuillez saisir le motif de refus.' });
            return;
        }
        this.reservationService.refuser(r.id, this.motifRefus).subscribe({
            next: () => { this.dialogRefus = false; this.load(); this.notifyChange(); this.messageService.add({ severity: 'success', summary: 'Réservation refusée', detail: `La réservation de ${r.utilisateurNom} a été refusée.` }); },
            error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: e.error?.message || 'Une erreur est survenue.' })
        });
    }

    ouvrirPaiement(r: Reservation) {
        this.resSelectionnee.set(r);
        this.modePaiement = 'ESPECES';
        this.telephone = '';
        this.referenceCheque = '';
        this.nomBanque = '';
        this.dateSortieReelle = r.dateDepart;
        this.avertissementSortie = false;
        this.montantCalcule = r.montantTotal ?? 0;
        this.dialogPaiement = true;
    }

    onDateSortieChange(val: string) {
        this.dateSortieReelle = val;
        const r = this.resSelectionnee();
        this.avertissementSortie = !!(r && val && val > r.dateDepart);
        if (!r || !val) { this.montantCalcule = 0; return; }
        const arrivee = new Date(r.dateArrivee);
        const sortie = new Date(val);
        let nuits = Math.ceil((sortie.getTime() - arrivee.getTime()) / (1000 * 60 * 60 * 24));
        if (nuits < 1) nuits = 1;
        const departPrev = r.dateDepart;
        const nuitsPlanifiees = Math.ceil((new Date(departPrev).getTime() - new Date(r.dateArrivee).getTime()) / (1000 * 60 * 60 * 24)) || 1;
        const prixParNuit = (r.montantTotal ?? 0) / nuitsPlanifiees;
        this.montantCalcule = Math.round(prixParNuit * nuits);
    }

    confirmerPaiement() {
        const r = this.resSelectionnee();
        if (!r) return;
        this.paiementService.enregistrer({
            reservationId: r.id,
            montant: this.montantCalcule,
            modePaiement: this.isMobileMoney() ? 'MOBILE_MONEY' : this.modePaiement,
            reference: this.modePaiement === 'CHEQUE'
                ? `${this.referenceCheque}${this.nomBanque ? ' - ' + this.nomBanque : ''}`
                : this.isMobileMoney() ? `${this.modePaiement} - ${this.telephone}` : undefined,
            dateSortieReelle: this.dateSortieReelle || undefined
        }).subscribe({
            next: () => {
                this.dialogPaiement = false;
                this.load();
                this.notifyChange();
                this.messageService.add({ severity: 'success', summary: 'Paiement enregistré', detail: 'Le paiement a bien été enregistré.' });
            },
            error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: e.error?.message || "Impossible d'enregistrer le paiement." })
        });
    }

    recu(r: Reservation) {
        this.paiementService.telechargerFacture(r.id).subscribe({
            next: (blob) => {
                if (!blob || blob.size === 0) {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Le reçu est vide ou introuvable.' });
                    return;
                }
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `recu-${r.id}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.messageService.add({ severity: 'success', summary: 'Reçu téléchargé', detail: `Le reçu de la réservation #${r.id} a été téléchargé.` });
            },
            error: (e) => {
                const msg = e?.error?.message || e?.message || 'Impossible de télécharger le reçu.';
                this.messageService.add({ severity: 'error', summary: 'Erreur PDF', detail: msg });
            }
        });
    }
}
