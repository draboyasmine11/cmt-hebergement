import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { PaiementService } from '@/app/core/services/paiement.service';
import { ReservationService } from '@/app/core/services/reservation.service';
import { AuthService } from '@/app/core/services/auth.service';
import { ModePaiement, Paiement, Reservation } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-paiements',
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputNumberModule, InputTextModule, ToastModule, SelectModule, ToolbarModule, IconFieldModule, InputIconModule, TooltipModule],
    template: `
        <p-toast />
        <div class="flex flex-col gap-6">
            <!-- En-tête -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-extrabold text-slate-800">{{ auth.isClient() ? 'Mes paiements' : 'Encaissements' }}</h1>
                    <p class="text-sm text-slate-500 mt-1">{{ auth.isClient() ? 'Historique de vos paiements et factures.' : 'Suivi des paiements et encaissements effectués.' }}</p>
                </div>
                @if (auth.isGerant()) {
                    <button (click)="openDialog()" pTooltip="Enregistrer un nouveau paiement" tooltipPosition="left" class="flex items-center gap-2 px-4 py-2.5 bg-[#00529B] hover:bg-[#00407a] text-white rounded-xl text-sm font-bold cursor-pointer">
                        <i class="pi pi-wallet"></i> Enregistrer un paiement
                    </button>
                }
            </div>

            <!-- Cartes totaux -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <i class="pi pi-wallet text-xl"></i>
                    </div>
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total encaissé</span>
                        <span class="text-xl font-extrabold text-slate-800">{{ totalEncaisse() | number }} FCFA</span>
                    </div>
                </div>
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <i class="pi pi-list text-xl"></i>
                    </div>
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nombre de paiements</span>
                        <span class="text-xl font-extrabold text-slate-800">{{ paiements().length }}</span>
                    </div>
                </div>
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <i class="pi pi-chart-line text-xl"></i>
                    </div>
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Montant moyen</span>
                        <span class="text-xl font-extrabold text-slate-800">{{ moyennePaiement() | number }} FCFA</span>
                    </div>
                </div>
            </div>

            <!-- Bilan mensuel pour l'admin -->
            @if (auth.isAdmin()) {
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-100">
                        <h3 class="text-lg font-bold text-slate-800">Bilan mensuel des encaissements</h3>
                    </div>
                    <p-table [value]="bilanMensuel()" [paginator]="true" [rows]="12">
                        <ng-template #header>
                            <tr><th>Mois</th><th>Année</th><th>Montant total</th><th>Nombre d'encaissements</th></tr>
                        </ng-template>
                        <ng-template #body let-b>
                            <tr>
                                <td class="font-semibold">{{ moisLabel(b.mois) }}</td>
                                <td>{{ b.annee }}</td>
                                <td class="font-bold text-slate-800">{{ b.montant | number }} FCFA</td>
                                <td>{{ b.nombre }}</td>
                            </tr>
                        </ng-template>
                        <ng-template #emptymessage>
                            <tr><td colspan="4" class="text-center py-8 text-slate-400">Aucun encaissement enregistré</td></tr>
                        </ng-template>
                    </p-table>
                </div>
            }

            <!-- Tableau détaillé -->
            <p-toolbar styleClass="mb-4">
                <ng-template #end>
                    <p-iconfield iconPosition="left">
                        <p-inputicon class="pi pi-search" />
                        <input pInputText placeholder="Rechercher client, mode de paiement…" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
                    </p-iconfield>
                </ng-template>
            </p-toolbar>
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <p-table [value]="filteredPaiements()" [paginator]="true" [rows]="10">
                    <ng-template #header>
                        <tr><th>Date</th><th>Client</th><th>Montant</th><th>Mode</th><th>Référence</th><th>Actions</th></tr>
                    </ng-template>
                    <ng-template #body let-p>
                        <tr>
                            <td>{{ p.datePaiement | date:'dd/MM/yyyy HH:mm' }}</td>
                            <td>{{ p.clientNom }}</td>
                            <td class="font-bold text-slate-800">{{ p.montant | number }} FCFA</td>
                            <td>
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                    [class.bg-emerald-50]="p.modePaiement==='ESPECES'" [class.text-emerald-700]="p.modePaiement==='ESPECES'"
                                    [class.bg-blue-50]="p.modePaiement==='CHEQUE'" [class.text-blue-700]="p.modePaiement==='CHEQUE'"
                                    [class.bg-amber-50]="p.modePaiement==='MOBILE_MONEY'" [class.text-amber-700]="p.modePaiement==='MOBILE_MONEY'">
                                    {{ modeLabel(p.modePaiement) }}
                                </span>
                            </td>
                            <td>{{ p.reference || '-' }}</td>
                            <td>
                                <p-button icon="pi pi-file-pdf" [rounded]="true" [text]="true" (onClick)="facture(p.reservationId)" pTooltip="Télécharger la facture PDF" tooltipPosition="top" />
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template #emptymessage>
                        <tr><td colspan="6" class="text-center py-8 text-slate-400">Aucun paiement enregistré</td></tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- Dialog -->
        <p-dialog [(visible)]="dialogVisible" header="Enregistrer un paiement" [modal]="true" [style]="{ width: '450px' }">
            <div class="flex flex-col gap-4 pt-2">
                <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold text-slate-700">Réservation validée</label>
                    <select [(ngModel)]="form.reservationId"
                        class="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20 bg-white appearance-none">
                        <option [ngValue]="undefined" disabled>Sélectionner une réservation</option>
                        @for (r of reservationsValidees(); track r.value) {
                            <option [ngValue]="r.value">{{ r.label }}</option>
                        }
                    </select>
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold text-slate-700">Montant (FCFA)</label>
                    <p-inputnumber class="w-full" [(ngModel)]="form.montant" />
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold text-slate-700">Mode de paiement</label>
                    <select [(ngModel)]="form.modePaiement" (ngModelChange)="onModeChange()"
                        class="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20 bg-white">
                        <optgroup label="Espèces &amp; Chèque">
                            <option value="ESPECES">💵 Espèces</option>
                            <option value="CHEQUE">✍️ Chèque</option>
                        </optgroup>
                        <optgroup label="Mobile Money">
                            <option value="ORANGE_MONEY">🟠 Orange Money</option>
                            <option value="MOOV_MONEY">🔵 Moov Money</option>
                            <option value="WAVE">🟡 Wave</option>
                            <option value="CORIS_MONEY">🟢 Coris Money</option>
                            <option value="TELECEL_MONEY">🟣 Telecel Money</option>
                        </optgroup>
                    </select>
                </div>
                @if (isMobileMoney()) {
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-semibold text-slate-700">Numéro de téléphone Mobile Money</label>
                        <input pInputText [(ngModel)]="form.telephone" placeholder="Ex: 70 00 00 00" class="w-full" />
                    </div>
                }
                <div class="flex flex-col gap-1">
                    <label class="text-sm font-semibold text-slate-700">Référence (optionnel)</label>
                    <input pInputText class="w-full" [(ngModel)]="form.reference" placeholder="N° de reçu, référence chèque..." />
                </div>
            </div>
            <ng-template #footer>
                <p-button label="Annuler" [text]="true" (onClick)="dialogVisible = false" pTooltip="Fermer sans enregistrer" tooltipPosition="top" />
                <p-button label="Enregistrer" (onClick)="save()" pTooltip="Enregistrer le paiement" tooltipPosition="top" />
            </ng-template>
        </p-dialog>
    `
})
export class Paiements implements OnInit {
    auth = inject(AuthService);
    private paiementService = inject(PaiementService);
    private reservationService = inject(ReservationService);
    private messageService = inject(MessageService);

    paiements = signal<Paiement[]>([]);
    reservationsValidees = signal<{ label: string; value: number }[]>([]);
    dialogVisible = false;
    form: { reservationId?: number; montant?: number; modePaiement?: ModePaiement; reference?: string; telephone?: string } = {};
    searchQuery = signal('');

    filteredPaiements = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        if (!q) return this.paiements();
        return this.paiements().filter(p =>
            (p.clientNom || '').toLowerCase().includes(q) ||
            (p.modePaiement || '').toLowerCase().includes(q) ||
            (p.reference || '').toLowerCase().includes(q)
        );
    });

    bilanMensuel = computed(() => {
        const map = new Map<string, { mois: number; annee: number; montant: number; nombre: number }>();
        for (const p of this.paiements()) {
            const d = new Date(p.datePaiement);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            const entry = map.get(key) || { mois: d.getMonth() + 1, annee: d.getFullYear(), montant: 0, nombre: 0 };
            entry.montant += p.montant;
            entry.nombre++;
            map.set(key, entry);
        }
        return Array.from(map.values()).sort((a, b) => b.annee - a.annee || b.mois - a.mois);
    });

    moisLabel(m: number): string {
        const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return mois[m - 1] || m.toString();
    }

    isMobileMoney() {
        return ['ORANGE_MONEY','MOOV_MONEY','WAVE','CORIS_MONEY','TELECEL_MONEY'].includes(this.form.modePaiement ?? '');
    }

    onModeChange() {
        this.form.telephone = '';
    }

    totalEncaisse() { return this.paiements().reduce((s, p) => s + p.montant, 0); }
    moyennePaiement() {
        const list = this.paiements();
        return list.length ? Math.round(list.reduce((s, p) => s + p.montant, 0) / list.length) : 0;
    }
    modeLabel(m: ModePaiement) {
        const map: Record<string, string> = {
            ESPECES: 'Espèces', CHEQUE: 'Chèque',
            ORANGE_MONEY: 'Orange Money', MOOV_MONEY: 'Moov Money',
            WAVE: 'Wave', CORIS_MONEY: 'Coris Money', TELECEL_MONEY: 'Telecel Money',
            MOBILE_MONEY: 'Mobile Money'
        };
        return map[m] ?? m;
    }

    ngOnInit() { this.load(); }

    load() {
        if (this.auth.isClient()) {
            this.paiementService.getMesPaiements().subscribe((p) => this.paiements.set(p));
            return;
        }
        const centreId = this.auth.user()?.centreId;
        const obs = centreId ? this.paiementService.getByCentre(centreId) : this.paiementService.getAll();
        obs.subscribe((p) => this.paiements.set(p));
    }

    openDialog() {
        const centreId = this.auth.user()?.centreId;
        const obs = centreId ? this.reservationService.getByCentre(centreId) : this.reservationService.getAll();
        obs.subscribe((res: Reservation[]) => {
            this.reservationsValidees.set(
                res.filter((r) => r.statut === 'VALIDEE' && !r.payee)
                    .map((r) => ({ label: `#${r.id} - ${r.utilisateurNom} - Ch. ${r.chambreNumero}`, value: r.id }))
            );
            this.form = { modePaiement: 'ESPECES' };
            this.dialogVisible = true;
        });
    }

    save() {
        if (!this.form.reservationId || !this.form.montant || !this.form.modePaiement) return;
        this.paiementService.enregistrer({
            reservationId: this.form.reservationId,
            montant: this.form.montant,
            modePaiement: this.isMobileMoney() ? 'MOBILE_MONEY' : this.form.modePaiement,
            reference: this.isMobileMoney()
                ? `${this.modeLabel(this.form.modePaiement!)} - ${this.form.telephone ?? ''}`
                : this.form.reference
        }).subscribe({
            next: () => { this.dialogVisible = false; this.load(); this.messageService.add({ severity: 'success', summary: 'Paiement enregistré' }); },
            error: (e) => this.messageService.add({ severity: 'error', detail: e.error?.message })
        });
    }

    facture(reservationId: number) {
        this.paiementService.telechargerFacture(reservationId).subscribe((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `facture-${reservationId}.pdf`; a.click();
            URL.revokeObjectURL(url);
        });
    }
}
