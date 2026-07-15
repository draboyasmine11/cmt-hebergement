import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { CentreService } from '@/app/core/services/centre.service';
import { UtilisateurService } from '@/app/core/services/utilisateur.service';
import { AuthService } from '@/app/core/services/auth.service';
import { Centre, StatutCentre, Utilisateur } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-centres',
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, TextareaModule, InputNumberModule, TagModule, ToastModule, ProgressSpinnerModule, SelectModule, TooltipModule],
    template: `
        <p-toast />

        <!-- Overlay de chargement global -->
        @if (loading()) {
            <div class="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
                <div class="bg-white rounded-2xl p-6 flex items-center gap-3 shadow-xl">
                    <p-progressSpinner strokeWidth="4" [style]="{width:'32px',height:'32px'}" />
                    <span class="text-sm font-semibold text-slate-600">Chargement...</span>
                </div>
            </div>
        }

        <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-extrabold text-slate-800">Centres d'hébergement CMT</h1>
                    <p class="text-sm text-slate-500 mt-1">Liste de tous les centres du réseau SONABEL.</p>
                </div>
                @if (auth.isAdmin()) {
                    <button (click)="openDialog()" [disabled]="loading()"
                        pTooltip="Ajouter un nouveau centre d'hébergement" tooltipPosition="left"
                        class="flex items-center gap-2 px-4 py-2.5 bg-[#00529B] hover:bg-[#00407a] text-white rounded-xl text-sm font-bold cursor-pointer disabled:opacity-50">
                        <i class="pi pi-plus"></i> Nouveau centre
                    </button>
                }
            </div>

            <div class="mb-4 flex flex-col sm:flex-row gap-3">
                <span class="p-input-icon-left w-full md:w-96 block">
                    <i class="pi pi-search"></i>
                    <input pInputText class="w-full" placeholder="Rechercher par nom ou ville…"
                        [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
                </span>
            </div>

            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <p-table [value]="filteredCentres()" [paginator]="true" [rows]="10" [rowHover]="true" dataKey="id">
                    <ng-template #header>
                        <tr>
                            <th>Nom</th>
                            <th>Ville</th>
                            <th>Adresse</th>
                            <th>Chambres</th>
                            <th>Gérant</th>
                            @if (auth.isAdmin() || auth.isGerant()) { <th>Actions</th> }
                        </tr>
                    </ng-template>
                    <ng-template #body let-centre>
                        <tr>
                            <td class="font-semibold text-slate-800">{{ centre.nom }}</td>
                            <td>{{ centre.ville }}</td>
                            <td>{{ centre.adresse }}</td>
                            <td>{{ centre.chambresDisponibles ?? 0 }} / {{ centre.nombreChambres ?? 0 }}</td>
                            <td>{{ centre.gerantNom || '—' }}</td>
                            @if (auth.isAdmin() || (auth.isGerant() && centre.id === auth.user()?.centreId)) {
                                <td>
                                    <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" (onClick)="edit(centre)" [disabled]="loading()" pTooltip="Modifier le centre" tooltipPosition="top" />
                                    @if (auth.isAdmin()) {
                                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [text]="true" (onClick)="remove(centre)" [disabled]="loading()" pTooltip="Supprimer le centre" tooltipPosition="top" />
                                    }
                                </td>
                            }
                        </tr>
                    </ng-template>
                    <ng-template #emptymessage>
                        <tr><td colspan="6" class="text-center py-8 text-slate-400">Aucun centre enregistré</td></tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- Dialog création/édition -->
        <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Modifier le centre' : 'Nouveau centre'" [modal]="true" [style]="{ width: '620px' }">
            <div class="flex flex-col gap-4 pt-2">
                <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2 flex flex-col gap-1">
                        <label class="text-sm font-bold text-slate-700">Nom du centre <span class="text-red-500">*</span></label>
                        <input [(ngModel)]="form.nom" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20"
                            placeholder="Ex: CMT Ouagadougou" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-bold text-slate-700">Ville <span class="text-red-500">*</span></label>
                        <input [(ngModel)]="form.ville" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20"
                            placeholder="Ex: Ouagadougou" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-bold text-slate-700">Adresse <span class="text-red-500">*</span></label>
                        <input [(ngModel)]="form.adresse" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20"
                            placeholder="Ex: Av. de la Nation" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-bold text-slate-700">Téléphone <span class="text-red-500">*</span></label>
                        <input [(ngModel)]="form.telephone" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20"
                            placeholder="Ex: +226 25 30 61 00" />
                    </div>
                    <div class="col-span-2 flex flex-col gap-1">
                        <label class="text-sm font-bold text-slate-700">Description <span class="text-red-500">*</span></label>
                        <textarea [(ngModel)]="form.description" rows="3"
                            class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20 resize-none"
                            placeholder="Description du centre..."></textarea>
                    </div>
                    <!-- Gérance -->
                    <div class="col-span-2 flex flex-col gap-1">
                        <label class="text-sm font-bold text-slate-700">Gérance <span class="text-red-500">*</span></label>
                        <select [(ngModel)]="form.gerantId" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00529B]/20 bg-white">
                            <option [ngValue]="undefined">-- Sélectionner un gérant --</option>
                            @for (g of gerants(); track g.id) {
                                <option [ngValue]="g.id">{{ g.prenom }} {{ g.nom }} ({{ g.email }})</option>
                            }
                        </select>
                    </div>
                    <!-- Coordonnées optionnelles -->
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-bold text-slate-500">Latitude <span class="text-slate-400 text-xs">(optionnel)</span></label>
                        <input type="number" [(ngModel)]="form.latitude" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="Ex: 12.3714" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-sm font-bold text-slate-500">Longitude <span class="text-slate-400 text-xs">(optionnel)</span></label>
                        <input type="number" [(ngModel)]="form.longitude" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" placeholder="Ex: -1.5197" />
                    </div>
                </div>

                @if (erreurForm) {
                    <div class="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                        <i class="pi pi-exclamation-triangle shrink-0"></i> {{ erreurForm }}
                    </div>
                }
            </div>
            <ng-template #footer>
                <p-button label="Annuler" [text]="true" (onClick)="dialogVisible = false" [disabled]="saving()" pTooltip="Fermer sans enregistrer" tooltipPosition="top" />
                <p-button [label]="saving() ? 'Enregistrement...' : 'Enregistrer'" (onClick)="save()" [disabled]="saving()" [loading]="saving()" pTooltip="Enregistrer le centre" tooltipPosition="top" />
            </ng-template>
        </p-dialog>
    `
})
export class Centres implements OnInit {
    auth = inject(AuthService);
    private centreService = inject(CentreService);
    private utilisateurService = inject(UtilisateurService);
    private messageService = inject(MessageService);

    centres = signal<Centre[]>([]);
    gerants = signal<Utilisateur[]>([]);
    loading = signal(false);
    saving = signal(false);
    dialogVisible = false;
    editMode = false;
    selectedId?: number;
    erreurForm = '';
    form: Partial<Centre> & { gerantId?: number } = {};
    searchQuery = signal('');

    filteredCentres = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        if (!q) return this.centres();
        return this.centres().filter(c =>
            c.nom.toLowerCase().includes(q) || c.ville.toLowerCase().includes(q)
        );
    });

    ngOnInit() { this.load(); }

    load() {
        this.loading.set(true);
        this.centreService.getAll().subscribe({
            next: (data) => { this.centres.set(data); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }

    openDialog() {
        this.editMode = false;
        this.form = { statut: 'ACTIF' as StatutCentre };
        this.erreurForm = '';
        this.dialogVisible = true;
        this.utilisateurService.getAll().subscribe((u) =>
            this.gerants.set(u.filter(x => x.roles.includes('GERANT')))
        );
    }

    edit(centre: Centre) {
        this.editMode = true;
        this.selectedId = centre.id;
        this.form = { ...centre };
        this.erreurForm = '';
        this.dialogVisible = true;
        this.utilisateurService.getAll().subscribe((u) =>
            this.gerants.set(u.filter(x => x.roles.includes('GERANT')))
        );
    }

    save() {
        if (!this.form.nom?.trim()) { this.erreurForm = 'Le nom du centre est obligatoire.'; return; }
        if (!this.form.ville?.trim()) { this.erreurForm = 'La ville est obligatoire.'; return; }
        if (!this.form.adresse?.trim()) { this.erreurForm = 'L\'adresse est obligatoire.'; return; }
        if (!this.form.telephone?.trim()) { this.erreurForm = 'Le téléphone est obligatoire.'; return; }
        if (!this.form.description?.trim()) { this.erreurForm = 'La description est obligatoire.'; return; }
        if (!this.form.gerantId && !this.editMode) { this.erreurForm = 'Veuillez associer un gérant au centre.'; return; }
        this.erreurForm = '';
        this.saving.set(true);
        const payload = { ...this.form, statut: 'ACTIF' as StatutCentre };
        const obs = this.editMode && this.selectedId
            ? this.centreService.update(this.selectedId, payload)
            : this.centreService.create(payload);
        obs.subscribe({
            next: () => {
                this.saving.set(false);
                this.dialogVisible = false;
                this.load();
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Centre enregistré avec succès.' });
            },
            error: (err) => {
                this.saving.set(false);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.error?.message || 'Échec de l\'enregistrement.' });
            }
        });
    }

    remove(centre: Centre) {
        if (!confirm(`Supprimer le centre "${centre.nom}" ?`)) return;
        this.loading.set(true);
        this.centreService.delete(centre.id).subscribe({
            next: () => { this.load(); this.messageService.add({ severity: 'success', summary: 'Supprimé' }); },
            error: (err) => { this.loading.set(false); this.messageService.add({ severity: 'error', detail: err.error?.message }); }
        });
    }
}
