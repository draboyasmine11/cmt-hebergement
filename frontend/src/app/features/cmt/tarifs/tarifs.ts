import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { TarifService } from '@/app/core/services/tarif.service';
import { CentreService } from '@/app/core/services/centre.service';
import { Centre, Tarif, TypeClient } from '@/app/core/models/cmt.models';

@Component({
    selector: 'app-tarifs',
    standalone: true,
    providers: [MessageService],
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
        InputNumberModule, SelectModule, TagModule, ToastModule, TooltipModule],
    styles: [`:host ::ng-deep .p-inputnumber { width: 100%; }`],
    template: `
        <p-toast />
        <div class="card">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                    <h2 class="text-2xl font-bold m-0">Tarifs par centre</h2>
                    <p class="text-sm text-slate-500 mt-1 m-0">Définissez les prix par nuit selon le type de client et le centre</p>
                </div>
                <p-button label="Définir un tarif" icon="pi pi-plus" (onClick)="openDialog()"
                    pTooltip="Ajouter ou modifier un tarif" tooltipPosition="left" />
            </div>

            <!-- Filtre par centre -->
            <div class="mb-4">
                <p-select [options]="centres()" [(ngModel)]="centreSelectionne" optionLabel="nom" optionValue="id"
                    class="w-full sm:w-80" placeholder="Filtrer par centre" [showClear]="true" appendTo="body"
                    (onChange)="onCentreChange()" />
            </div>

            <p-table [value]="tarifs()" [paginator]="true" [rows]="15" [rowHover]="true" [loading]="loading()">
                <ng-template #header>
                    <tr>
                        <th>Centre</th>
                        <th>Ville</th>
                        <th>Type client</th>
                        <th>Prix / Nuit</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template #body let-t>
                    <tr>
                        <td class="font-semibold">{{ t.centreNom }}</td>
                        <td>{{ t.centreVille }}</td>
                        <td>
                            <p-tag [value]="typeLabel(t.typeClient)" [severity]="typeSeverity(t.typeClient)" />
                        </td>
                        <td class="font-bold text-[#00529B]">{{ t.prixParNuit | number }} FCFA</td>
                        <td>
                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true"
                                (onClick)="edit(t)" pTooltip="Modifier ce tarif" tooltipPosition="top" />
                        </td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr><td colspan="5" class="text-center py-8 text-slate-400">Aucun tarif défini.</td></tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Modifier le tarif' : 'Définir un tarif'"
            [modal]="true" [style]="{ width: '420px' }">
            <div class="flex flex-col gap-4 pt-2">
                <div>
                    <label class="block mb-2 font-semibold">Centre <span class="text-red-500">*</span></label>
                    <p-select [options]="centres()" [(ngModel)]="form.centreId" optionLabel="nom" optionValue="id"
                        class="w-full" appendTo="body" placeholder="Sélectionner un centre" />
                </div>
                <div>
                    <label class="block mb-2 font-semibold">Type client <span class="text-red-500">*</span></label>
                    <p-select [options]="typeClientOptions" [(ngModel)]="form.typeClient"
                        optionLabel="label" optionValue="value" class="w-full" appendTo="body" />
                </div>
                <div>
                    <label class="block mb-2 font-semibold">Prix par nuit (FCFA) <span class="text-red-500">*</span></label>
                    <p-inputnumber [(ngModel)]="form.prixParNuit" [min]="0" [useGrouping]="true"
                        placeholder="Ex: 5000" class="w-full" />
                </div>
            </div>
            <ng-template #footer>
                <p-button label="Annuler" [text]="true" (onClick)="dialogVisible = false" />
                <p-button label="Enregistrer" icon="pi pi-check" (onClick)="save()" [loading]="saving()" />
            </ng-template>
        </p-dialog>
    `
})
export class Tarifs implements OnInit {
    private tarifService = inject(TarifService);
    private centreService = inject(CentreService);
    private messageService = inject(MessageService);

    tarifs = signal<Tarif[]>([]);
    centres = signal<Centre[]>([]);
    loading = signal(false);
    saving = signal(false);
    dialogVisible = false;
    editMode = false;
    centreSelectionne: number | null = null;
    form: { centreId?: number; typeClient?: TypeClient; prixParNuit?: number } = {};

    typeClientOptions = [
        { label: 'Agent SONABEL', value: 'AGENT_SONABEL' as TypeClient },
        { label: 'Retraité SONABEL', value: 'RETRAITE_SONABEL' as TypeClient },
        { label: 'Client externe', value: 'CLIENT_EXTERNE' as TypeClient }
    ];

    ngOnInit() {
        this.centreService.getAll().subscribe(c => {
            this.centres.set(c);
            this.loadAll();
        });
    }

    loadAll() {
        this.loading.set(true);
        const centres = this.centres();
        if (!centres.length) { this.loading.set(false); return; }
        const centreIds = this.centreSelectionne ? [this.centreSelectionne] : centres.map(c => c.id);
        const all: Tarif[] = [];
        let done = 0;
        for (const id of centreIds) {
            this.tarifService.getByCentre(id).subscribe({
                next: (t) => {
                    all.push(...t);
                    done++;
                    if (done === centreIds.length) {
                        this.tarifs.set(all.sort((a, b) => (a.centreNom || '').localeCompare(b.centreNom || '')));
                        this.loading.set(false);
                    }
                },
                error: () => { done++; if (done === centreIds.length) this.loading.set(false); }
            });
        }
    }

    onCentreChange() { this.loadAll(); }

    openDialog() {
        this.editMode = false;
        this.form = {};
        this.dialogVisible = true;
    }

    edit(t: Tarif) {
        this.editMode = true;
        this.form = { centreId: t.centreId, typeClient: t.typeClient, prixParNuit: t.prixParNuit };
        this.dialogVisible = true;
    }

    save() {
        if (!this.form.centreId || !this.form.typeClient || !this.form.prixParNuit) {
            this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Tous les champs sont obligatoires.' });
            return;
        }
        this.saving.set(true);
        this.tarifService.save({
            centreId: this.form.centreId,
            typeClient: this.form.typeClient,
            prixParNuit: this.form.prixParNuit
        }).subscribe({
            next: () => {
                this.saving.set(false);
                this.dialogVisible = false;
                this.loadAll();
                this.messageService.add({ severity: 'success', summary: 'Enregistré', detail: 'Tarif mis à jour avec succès.' });
            },
            error: (e) => {
                this.saving.set(false);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: e.error?.message || 'Échec de l\'enregistrement.' });
            }
        });
    }

    typeLabel(t: TypeClient) {
        if (t === 'AGENT_SONABEL') return 'Agent SONABEL';
        if (t === 'RETRAITE_SONABEL') return 'Retraité SONABEL';
        return 'Client externe';
    }

    typeSeverity(t: TypeClient): 'info' | 'success' | 'warn' {
        if (t === 'AGENT_SONABEL') return 'info';
        if (t === 'RETRAITE_SONABEL') return 'success';
        return 'warn';
    }
}
