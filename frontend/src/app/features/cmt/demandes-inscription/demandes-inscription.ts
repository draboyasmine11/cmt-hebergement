import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { InscriptionService } from '@/app/core/services/inscription.service';
import { NotificationService } from '@/app/core/services/notification.service';
import { DemandeInscription } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-demandes-inscription',
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, DialogModule, InputTextModule, TagModule, TooltipModule],
    template: `
        <p-toast />
        <div class="card">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-xl font-semibold">Demandes d'inscription</h2>
                    <p class="text-sm text-muted-color">Gérez les demandes d'inscription en attente de validation</p>
                </div>
                <p-button label="Actualiser" icon="pi pi-refresh" severity="secondary" (onClick)="charger()" pTooltip="Actualiser la liste des demandes" tooltipPosition="left" />
            </div>

            <p-table [value]="filteredDemandes()" [paginator]="true" [rows]="10" dataKey="id" styleClass="p-datatable-striped">
                <ng-template #caption>
                    <div class="flex items-center justify-between gap-3">
                        <input pInputText type="text" placeholder="Rechercher..." class="w-full max-w-xs"
                            [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
                        <p-tag [value]="demandes().length + ' demande(s)'" severity="info" />
                    </div>
                </ng-template>
                <ng-template #header>
                    <tr>
                        <th>Nom/Prenom</th>
                        <th>Profil</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Matricule</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-d>
                    <tr>
                        <td class="font-medium">{{ d.prenom }} {{ d.nom }}</td>
                        <td>
                            <p-tag [value]="labelProfil(d.typeClient)" [severity]="severiteProfil(d.typeClient)" />
                        </td>
                        <td>{{ d.email }}</td>
                        <td>{{ d.telephone }}</td>
                        <td>{{ d.matricule || '-' }}</td>
                        <td class="text-sm">{{ d.createdAt | date:'short' }}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button icon="pi pi-eye" severity="info" pTooltip="Consulter" (onClick)="consulter(d)" />
                                <p-button icon="pi pi-check" severity="success" pTooltip="Approuver" (onClick)="approuver(d)" />
                                <p-button icon="pi pi-times" severity="danger" pTooltip="Rejeter" (onClick)="rejeter(d)" />
                            </div>
                        </td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr>
                        <td colspan="7" class="text-center text-muted-color py-8">Aucune demande d'inscription en attente</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="detailDialog" header="Dossier d'inscription" [modal]="true" [style]="{ width: '700px' }">
            @if (selected()) {
                <div class="flex flex-col gap-4 text-sm">
                    <div class="grid grid-cols-2 gap-3">
                        <div><span class="font-semibold text-slate-600">Nom :</span> {{ selected()!.nom }}</div>
                        <div><span class="font-semibold text-slate-600">Prénom :</span> {{ selected()!.prenom }}</div>
                        <div><span class="font-semibold text-slate-600">Sexe :</span> {{ selected()!.sexe === 'M' ? 'Masculin' : 'Féminin' }}</div>
                        <div><span class="font-semibold text-slate-600">Date naissance :</span> {{ selected()!.dateNaissance | date }}</div>
                        <div><span class="font-semibold text-slate-600">Email :</span> {{ selected()!.email }}</div>
                        <div><span class="font-semibold text-slate-600">Téléphone :</span> {{ selected()!.telephone }}</div>
                        <div><span class="font-semibold text-slate-600">Profil :</span> {{ labelProfil(selected()!.typeClient) }}</div>
                        @if (selected()!.matricule) {
                            <div><span class="font-semibold text-slate-600">Matricule :</span> {{ selected()!.matricule }}</div>
                        }
                        @if (selected()!.direction) {
                            <div><span class="font-semibold text-slate-600">Direction :</span> {{ selected()!.direction }}</div>
                        }
                        @if (selected()!.service) {
                            <div><span class="font-semibold text-slate-600">Service :</span> {{ selected()!.service }}</div>
                        }
                        @if (selected()!.fonction) {
                            <div><span class="font-semibold text-slate-600">Fonction :</span> {{ selected()!.fonction }}</div>
                        }
                        @if (selected()!.adresse) {
                            <div class="col-span-2"><span class="font-semibold text-slate-600">Adresse :</span> {{ selected()!.adresse }}</div>
                        }
                        @if (selected()!.typePiece) {
                            <div><span class="font-semibold text-slate-600">Type pièce :</span> {{ selected()!.typePiece }}</div>
                        }
                        @if (selected()!.numeroPiece) {
                            <div><span class="font-semibold text-slate-600">N° pièce :</span> {{ selected()!.numeroPiece }}</div>
                        }
                        @if (selected()!.dateDepartRetraite) {
                            <div><span class="font-semibold text-slate-600">Départ retraite :</span> {{ selected()!.dateDepartRetraite }}</div>
                        }
                        @if (selected()!.fichierJustificatif) {
                            <div class="col-span-2 mt-2">
                                <span class="font-semibold text-slate-600 block mb-1">Pièce justificative :</span>
                                <a [href]="'/api/uploads/' + selected()!.fichierJustificatif" target="_blank"
                                   class="text-[#00529B] hover:underline cursor-pointer inline-flex items-center gap-1.5 font-bold">
                                    <i class="pi pi-external-link text-xs"></i>
                                    Ouvrir / Télécharger
                                </a>
                            </div>
                        }
                    </div>
                    <div class="flex gap-3 mt-4">
                        <p-button label="Approuver" icon="pi pi-check" severity="success" class="flex-1" (onClick)="approuver(selected()!); detailDialog = false" pTooltip="Approuver et créer le compte utilisateur" tooltipPosition="top" />
                        <p-button label="Rejeter" icon="pi pi-times" severity="danger" class="flex-1" (onClick)="rejeter(selected()!); detailDialog = false" pTooltip="Rejeter cette demande d'inscription" tooltipPosition="top" />
                    </div>
                </div>
            }
        </p-dialog>

        <p-dialog [(visible)]="rejetDialog" header="Motif du rejet" [modal]="true" [style]="{ width: '450px' }">
            <div class="flex flex-col gap-4">
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Veuillez indiquer le motif du rejet :</label>
                    <textarea pInputTextarea [(ngModel)]="motifRejet" rows="4" class="w-full" placeholder="Expliquez la raison du rejet..." style="resize:vertical"></textarea>
                </div>
                <div class="flex gap-3 justify-end">
                    <p-button label="Annuler" severity="secondary" (onClick)="rejetDialog = false" pTooltip="Fermer sans rejeter" tooltipPosition="top" />
                    <p-button label="Confirmer le rejet" severity="danger" (onClick)="confirmerRejet()" pTooltip="Confirmer le rejet de cette demande" tooltipPosition="top" />
                </div>
            </div>
        </p-dialog>
    `
})
export class DemandesInscription implements OnInit {
    private inscriptionService = inject(InscriptionService);
    private notificationService = inject(NotificationService);
    private messageService = inject(MessageService);

    demandes = signal<DemandeInscription[]>([]);
    searchQuery = signal('');
    selected = signal<DemandeInscription | null>(null);

    filteredDemandes = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        if (!q) return this.demandes();
        return this.demandes().filter(d =>
            `${d.prenom} ${d.nom}`.toLowerCase().includes(q) ||
            (d.email || '').toLowerCase().includes(q) ||
            (d.typeClient || '').toLowerCase().includes(q) ||
            (d.matricule || '').toLowerCase().includes(q)
        );
    });
    detailDialog = false;
    rejetDialog = false;
    selectedForReject: DemandeInscription | null = null;
    motifRejet = '';

    ngOnInit() {
        this.charger();
        // Effacer le badge du menu dès la visite de la page
        this.notificationService.markDemandesPageVisited();
    }

    isImage(filename?: string): boolean {
        if (!filename) return false;
        const ext = filename.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
    }

    isPdf(filename?: string): boolean {
        return filename?.toLowerCase().endsWith('.pdf') ?? false;
    }

    charger() {
        this.inscriptionService.getDemandes().subscribe({
            next: (d) => this.demandes.set(d),
            error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les demandes.' })
        });
    }

    consulter(d: DemandeInscription) {
        this.selected.set(d);
        this.detailDialog = true;
    }

    approuver(d: DemandeInscription) {
        this.inscriptionService.approuver(d.id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Approuvé', detail: `Le compte de ${d.prenom} ${d.nom} a été approuvé.` });
                this.charger();
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message })
        });
    }

    rejeter(d: DemandeInscription) {
        this.selectedForReject = d;
        this.motifRejet = '';
        this.rejetDialog = true;
    }

    confirmerRejet() {
        if (!this.selectedForReject || !this.motifRejet.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Motif requis', detail: 'Veuillez saisir un motif de rejet.' });
            return;
        }
        this.inscriptionService.rejeter(this.selectedForReject.id, this.motifRejet).subscribe({
            next: () => {
                this.messageService.add({ severity: 'info', summary: 'Rejeté', detail: `Le compte de ${this.selectedForReject!.prenom} ${this.selectedForReject!.nom} a été rejeté.` });
                this.rejetDialog = false;
                this.charger();
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message })
        });
    }

    labelProfil(tc: string): string {
        const map: Record<string, string> = {
            AGENT_SONABEL: 'Agent SONABEL',
            RETRAITE_SONABEL: 'Retraité SONABEL',
            CLIENT_EXTERNE: 'Client Externe'
        };
        return map[tc] || tc;
    }

    severiteProfil(tc: string): 'info' | 'warn' | 'success' {
        const map: Record<string, 'info' | 'warn' | 'success'> = {
            AGENT_SONABEL: 'info',
            RETRAITE_SONABEL: 'warn',
            CLIENT_EXTERNE: 'success'
        };
        return map[tc] || 'info';
    }
}
