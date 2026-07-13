import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ChambreService } from '@/app/core/services/chambre.service';
import { CentreService } from '@/app/core/services/centre.service';
import { AuthService } from '@/app/core/services/auth.service';
import { CentreActifService } from '@/app/core/services/centre-actif.service';
import { TarifService } from '@/app/core/services/tarif.service';
import { SKIP_AUTH } from '@/app/core/interceptors/auth.interceptor';
import { environment } from '@/environments/environment';
import { Chambre, Centre, StatutChambre } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-chambres',
    standalone: true,
    providers: [MessageService],
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
        InputTextModule, SelectModule, InputNumberModule, TagModule, ToastModule,
        ToolbarModule, IconFieldModule, InputIconModule, TooltipModule
    ],
    styles: [`
        :host ::ng-deep .p-inputnumber { width: 100%; }
    `],
    template: `
        <p-toast />
        <div class="card">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                    <h2 class="text-2xl font-semibold m-0">Gestion des chambres</h2>
                    <p class="text-sm text-slate-500 mt-1 m-0">{{ chambres().length }} chambre(s) au total</p>
                </div>
                @if (auth.isAdmin() || auth.isGerant()) {
                    <p-button label="Nouvelle chambre" icon="pi pi-plus" (onClick)="openDialog()" pTooltip="Ajouter une nouvelle chambre" tooltipPosition="left" />
                }
            </div>
            <p-toolbar styleClass="mb-4">
                <ng-template #start>
                    @if (auth.isAdmin()) {
                        <p-select [options]="centres()" [ngModel]="centreFilter()" (ngModelChange)="centreFilter.set($event)"
                            optionLabel="nom" optionValue="id" class="w-full sm:w-64" placeholder="Tous les centres"
                            [showClear]="true" appendTo="body" />
                    }
                </ng-template>
                <ng-template #end>
                    <p-iconfield iconPosition="left">
                        <p-inputicon class="pi pi-search" />
                        <input pInputText placeholder="Rechercher…" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
                    </p-iconfield>
                </ng-template>
            </p-toolbar>
            <p-table [value]="filteredChambres()" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 25, 50, 100]" dataKey="id" [loading]="loading()">
                <ng-template #header>
                    <tr>
                        <th style="width:50px">Photo</th><th>N°</th><th>Centre</th><th>Prix/Nuit</th><th>Statut</th><th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-ch>
                    <tr>
                        <td>
                            @if (ch.image) {
                                <img [src]="'/api/uploads/' + ch.image" alt="Photo" class="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                            } @else {
                                <img src="/logo_sonabel.jpg" alt="Photo" class="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                            }
                        </td>
                        <td>{{ ch.numero }}</td>
                        <td>{{ ch.centreNom }}</td>
                        <td>{{ ch.prixParNuit ? (ch.prixParNuit | number) + ' FCFA' : '-' }}</td>
                        <td><p-tag [value]="ch.statut" [severity]="severity(ch.statut)" /></td>
                        <td>
                            <p-button icon="pi pi-eye" [rounded]="true" [text]="true" (onClick)="view(ch)" pTooltip="Voir les détails de la chambre" tooltipPosition="top" />
                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" (onClick)="edit(ch)" pTooltip="Modifier la chambre" tooltipPosition="top" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [text]="true" (onClick)="remove(ch)" pTooltip="Supprimer la chambre" tooltipPosition="top" />
                        </td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr><td colspan="6" class="text-center py-8 text-slate-400">Aucune chambre trouvée.</td></tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Modifier' : 'Nouvelle chambre'" [modal]="true" [style]="{ width: '500px' }">
            <div class="flex flex-col gap-4">
                <div><label class="block mb-2">Centre</label>
                    <p-select [options]="centres()" [(ngModel)]="form.centreId" optionLabel="nom" optionValue="id" class="w-full" appendTo="body" (onChange)="onCentreChange($event.value)" />
                </div>
                <div><label class="block mb-2">Numéro <span class="text-red-500">*</span></label><input pInputText class="w-full" [(ngModel)]="form.numero" /></div>
                <div><label class="block mb-2">Prix Agent SONABEL (FCFA) <span class="text-red-500">*</span></label>
                    <p-inputnumber class="w-full" [(ngModel)]="tarifAgent" [min]="0" [max]="1000000" [useGrouping]="true" />
                </div>
                <div><label class="block mb-2">Prix Retraité (FCFA) <span class="text-red-500">*</span></label>
                    <p-inputnumber class="w-full" [(ngModel)]="tarifRetraite" [min]="0" [max]="1000000" [useGrouping]="true" />
                </div>
                <div><label class="block mb-2">Prix Externe (FCFA) <span class="text-red-500">*</span></label>
                    <p-inputnumber class="w-full" [(ngModel)]="tarifExterne" [min]="0" [max]="1000000" [useGrouping]="true" />
                </div>
                <div>
                    <label class="block mb-2">Photo de la chambre</label>
                    <input type="file" accept=".jpg,.jpeg,.png,.gif" (change)="onPhotoChange($event)"
                        class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#00529B]/10 file:text-[#00529B] hover:file:bg-[#00529B]/20 cursor-pointer" />
                    @if (photoPreview) {
                        <div class="mt-2"><img [src]="photoPreview" alt="Aperçu" class="h-20 w-full rounded-xl object-cover border border-slate-200" /></div>
                    }
                </div>
                <div><label class="block mb-2">Statut</label>
                    <p-select [options]="statuts" [(ngModel)]="form.statut" optionLabel="label" optionValue="value" class="w-full" appendTo="body" />
                </div>
            </div>
            <ng-template #footer>
                <p-button label="Annuler" [text]="true" (onClick)="dialogVisible = false" pTooltip="Fermer sans enregistrer" tooltipPosition="top" />
                <p-button label="Enregistrer" (onClick)="save()" pTooltip="Enregistrer les modifications" tooltipPosition="top" />
            </ng-template>
        </p-dialog>

        <p-dialog [(visible)]="viewVisible" [header]="'Chambre ' + viewChambre()?.numero" [modal]="true" [style]="{ width: '450px' }">
            <div class="flex flex-col gap-4">
                @if (viewChambre()?.image) {
                    <img [src]="'/api/uploads/' + viewChambre()!.image" alt="Photo" class="w-full h-44 rounded-xl object-cover border border-slate-200" />
                } @else {
                    <img src="/logo_sonabel.jpg" alt="Photo" class="w-full h-44 rounded-xl object-cover border border-slate-200" />
                }
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div><span class="font-semibold text-slate-500">Numéro</span><p class="font-bold text-slate-800 mt-0.5">{{ viewChambre()?.numero }}</p></div>
                    <div><span class="font-semibold text-slate-500">Centre</span><p class="font-bold text-slate-800 mt-0.5">{{ viewChambre()?.centreNom }}</p></div>
                    <div><span class="font-semibold text-slate-500">Prix par nuit</span><p class="font-bold text-[#00529B] mt-0.5">{{ viewChambre()?.prixParNuit | number }} FCFA</p></div>
                    <div><span class="font-semibold text-slate-500">Statut</span><p class="mt-0.5"><p-tag [value]="viewChambre()?.statut" [severity]="severity(viewChambre()?.statut ?? 'DISPONIBLE')" /></p></div>
                </div>
            </div>
            <ng-template #footer>
                <p-button label="Fermer" (onClick)="viewVisible = false" pTooltip="Fermer cette fenêtre" tooltipPosition="top" />
            </ng-template>
        </p-dialog>
    `
})
export class Chambres implements OnInit {
    auth = inject(AuthService);
    private chambreService = inject(ChambreService);
    private centreService = inject(CentreService);
    private centreActif = inject(CentreActifService);
    private tarifService = inject(TarifService);
    private messageService = inject(MessageService);
    private http = inject(HttpClient);
    private router = inject(Router);

    chambres = signal<Chambre[]>([]);
    centres = signal<Centre[]>([]);
    loading = signal(false);
    dialogVisible = false;
    viewVisible = false;
    viewChambre = signal<Chambre | null>(null);
    editMode = false;
    selectedId?: number;
    form: Partial<Chambre> & { centreId?: number } = {};
    searchQuery = signal('');
    centreFilter = signal<number | null>(null);
    photoFile: File | null = null;
    photoPreview: string | null = null;
    tarifAgent = 0;
    tarifRetraite = 0;
    tarifExterne = 0;

    filteredChambres = computed(() => {
        let list = this.chambres();
        const centreId = this.centreFilter();
        if (centreId != null) {
            list = list.filter(ch => Number(ch.centreId) === Number(centreId));
        }
        const q = this.searchQuery().toLowerCase().trim();
        if (!q) return list;
        return list.filter(ch =>
            ch.numero.toLowerCase().includes(q) ||
            (ch.centreNom || '').toLowerCase().includes(q)
        );
    });

    statuts = [
        { label: 'Disponible', value: 'DISPONIBLE' as StatutChambre },
        { label: 'Occupée', value: 'OCCUPEE' as StatutChambre },
        { label: 'Maintenance', value: 'MAINTENANCE' as StatutChambre }
    ];

    ngOnInit() {
        this.centreService.getAll().subscribe((c) => this.centres.set(c));
        this.load();
        this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.load());
    }

    load() {
        this.loading.set(true);
        if (this.auth.isAdmin()) {
            this.chambreService.getAll().subscribe({
                next: (data) => { this.chambres.set(data || []); this.loading.set(false); },
                error: () => this.loading.set(false)
            });
            return;
        }
        const centreId = this.auth.user()?.centreId ?? this.centreActif.centreActif()?.id;
        if (!centreId) {
            this.loading.set(false);
            return;
        }
        this.chambreService.getByCentre(centreId).subscribe({
            next: (data) => { this.chambres.set(data || []); this.loading.set(false); },
            error: () => this.loading.set(false)
        });
    }

    severity(s: StatutChambre) {
        return s === 'DISPONIBLE' ? 'success' : s === 'OCCUPEE' ? 'warn' : 'danger';
    }

    openDialog() {
        this.editMode = false;
        const centreId = this.auth.isGerant() ? this.auth.user()?.centreId : undefined;
        this.form = {
            prixParNuit: 0,
            statut: 'DISPONIBLE',
            centreId
        };
        this.photoFile = null;
        this.photoPreview = null;
        this.tarifAgent = 0;
        this.tarifRetraite = 0;
        this.tarifExterne = 0;
        if (centreId) this.loadTarifs(centreId);
        this.dialogVisible = true;
    }

    edit(ch: Chambre) {
        this.editMode = true;
        this.selectedId = ch.id;
        this.form = { ...ch };
        this.photoFile = null;
        this.photoPreview = ch.image ? `/api/uploads/${ch.image}` : null;
        this.loadTarifs(ch.centreId);
        this.dialogVisible = true;
    }

    view(ch: Chambre) {
        this.viewChambre.set(ch);
        this.viewVisible = true;
    }

    onPhotoChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] ?? null;
        if (!file) return;
        this.photoFile = file;
        const reader = new FileReader();
        reader.onload = (e) => this.photoPreview = e.target?.result as string;
        reader.readAsDataURL(file);
    }

    onCentreChange(centreId: number) {
        if (centreId) this.loadTarifs(centreId);
    }

    private loadTarifs(centreId: number) {
        this.tarifService.getByCentre(centreId).subscribe(list => {
            for (const t of list) {
                if (t.typeClient === 'AGENT_SONABEL') this.tarifAgent = t.prixParNuit;
                if (t.typeClient === 'RETRAITE_SONABEL') this.tarifRetraite = t.prixParNuit;
                if (t.typeClient === 'CLIENT_EXTERNE') this.tarifExterne = t.prixParNuit;
            }
        });
    }

    private saveTarifs(centreId: number) {
        const tarifs = [
            { centreId, typeClient: 'AGENT_SONABEL' as const, prixParNuit: this.tarifAgent },
            { centreId, typeClient: 'RETRAITE_SONABEL' as const, prixParNuit: this.tarifRetraite },
            { centreId, typeClient: 'CLIENT_EXTERNE' as const, prixParNuit: this.tarifExterne },
        ];
        tarifs.forEach(t => this.tarifService.save(t).subscribe());
    }

    save() {
        if (!this.form.numero?.trim()) { this.messageService.add({ severity: 'warn', summary: 'Champ requis', detail: 'Le numéro de chambre est obligatoire.' }); return; }
        if (!this.tarifAgent || !this.tarifRetraite || !this.tarifExterne) { this.messageService.add({ severity: 'warn', summary: 'Champ requis', detail: 'Les 3 prix (Agent, Retraité, Externe) sont obligatoires.' }); return; }
        if (!this.form.centreId) { this.messageService.add({ severity: 'warn', summary: 'Champ requis', detail: 'Le centre est obligatoire.' }); return; }
        if (!this.form.statut) { this.form.statut = 'DISPONIBLE'; }
        const doSave = (imageName: string | null) => {
            const payload = {
                numero: this.form.numero,
                image: imageName || this.form.image || null,
                prixParNuit: this.tarifAgent,
                statut: this.form.statut,
                centreId: Number(this.form.centreId)
            };
            const obs = this.editMode && this.selectedId
                ? this.chambreService.update(this.selectedId, payload as Chambre & { centreId: number })
                : this.chambreService.create(payload as Chambre & { centreId: number });
            obs.subscribe({
                next: (newChambre) => {
                    this.saveTarifs(this.form.centreId!);
                    this.dialogVisible = false;
                    this.load();
                    this.messageService.add({ severity: 'success', summary: 'Enregistré', detail: `Chambre ${newChambre.numero} ajoutée avec succès.` });
                },
                error: (e) => {
                    const detail = e.error?.errors ? Object.entries(e.error.errors).map(([k, v]) => `${k}: ${v}`).join(', ') : (e.error?.message || 'Erreur inconnue');
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail });
                }
            });
        };
        if (this.photoFile) {
            const formData = new FormData();
            formData.append('file', this.photoFile);
            this.http.post<{ filename: string }>(`${environment.apiUrl}/upload`, formData, { context: new HttpContext().set(SKIP_AUTH, true) })
                .subscribe({ next: (res) => doSave(res.filename), error: () => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de l\'upload de l\'image.' }) });
        } else {
            doSave(null);
        }
    }

    remove(ch: Chambre) {
        if (!confirm('Supprimer cette chambre ?')) return;
        this.chambreService.delete(ch.id).subscribe({ next: () => this.load() });
    }
}
