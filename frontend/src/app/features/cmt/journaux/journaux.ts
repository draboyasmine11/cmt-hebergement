import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

const LOGS = [
    { id: 1, action: 'VALIDATION_RESERVATION', utilisateur: 'Issa KABORE (Gérant)', detail: 'Réservation RES-1245 validée pour le client Mamadou TRAORE', date: '2026-06-11 09:30', type: 'success' },
    { id: 2, action: 'ENCAISSEMENT_PAIEMENT', utilisateur: 'Issa KABORE (Gérant)', detail: 'Paiement de 150 000 FCFA enregistré pour la réservation RES-1245 (Chèque)', date: '2026-06-11 09:35', type: 'success' },
    { id: 3, action: 'VALIDATION_RESERVATION', utilisateur: 'Alassane SAWADOGO (Gérant)', detail: 'Réservation RES-1240 validée pour la cliente Yasmine OUEDRAOGO', date: '2026-06-11 08:20', type: 'success' },
    { id: 4, action: 'ENCAISSEMENT_PAIEMENT', utilisateur: 'Alassane SAWADOGO (Gérant)', detail: 'Paiement de 80 000 FCFA enregistré pour la réservation RES-1240 (Espèces)', date: '2026-06-11 08:25', type: 'success' },
    { id: 5, action: 'VALIDATION_RESERVATION', utilisateur: 'Issa KABORE (Gérant)', detail: 'Réservation RES-1238 validée pour le client Adama ZONGO', date: '2026-06-10 16:15', type: 'success' },
    { id: 6, action: 'ENCAISSEMENT_PAIEMENT', utilisateur: 'Issa KABORE (Gérant)', detail: 'Paiement de 120 000 FCFA enregistré pour la réservation RES-1238 (Chèque)', date: '2026-06-10 16:20', type: 'success' }
];

@Component({
    selector: 'app-journaux',
    standalone: true,
    imports: [CommonModule, TableModule],
    template: `
        <div class="flex flex-col gap-6 min-h-[calc(100vh-140px)]">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-extrabold text-slate-800">Journaux d'activité</h1>
                    <p class="text-sm text-slate-500 mt-1">Historique de toutes les actions de validation et d'encaissement effectuées dans le système.</p>
                </div>
                <button class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer shadow-sm"
                    title="Exporter les journaux d'activité en fichier">
                    <i class="pi pi-download"></i> Exporter
                </button>
            </div>

            <!-- Filtres rapides -->
            <div class="flex gap-2 flex-wrap">
                @for (f of filtres; track f.value) {
                    <button (click)="filtre = f.value"
                        [title]="'Filtrer par : ' + f.label"
                        class="px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer"
                        [class.bg-[#00529B]]="filtre === f.value"
                        [class.text-white]="filtre === f.value"
                        [class.border-[#00529B]]="filtre === f.value"
                        [class.bg-white]="filtre !== f.value"
                        [class.text-slate-600]="filtre !== f.value"
                        [class.border-slate-200]="filtre !== f.value">
                        {{ f.label }}
                    </button>
                }
            </div>

            <!-- Table Container -->
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col flex-grow min-h-[500px]">
                <p-table [value]="filteredLogs()" [paginator]="true" [rows]="10" class="w-full flex-grow flex flex-col" [tableStyle]="{'min-height': '450px'}">
                    <ng-template #header>
                        <tr>
                            <th style="width: 8%">#</th>
                            <th style="width: 25%">Action</th>
                            <th style="width: 22%">Utilisateur</th>
                            <th style="width: 30%">Détail</th>
                            <th style="width: 15%">Date</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-log>
                        <tr class="hover:bg-slate-50/50 transition-colors">
                            <td class="text-slate-400 font-mono">{{ log.id }}</td>
                            <td class="font-bold text-slate-700">
                                <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold"
                                    [class.bg-emerald-50]="log.action==='VALIDATION_RESERVATION'" [class.text-emerald-700]="log.action==='VALIDATION_RESERVATION'"
                                    [class.bg-blue-50]="log.action==='ENCAISSEMENT_PAIEMENT'" [class.text-blue-700]="log.action==='ENCAISSEMENT_PAIEMENT'">
                                    {{ log.action }}
                                </span>
                            </td>
                            <td class="text-slate-600">{{ log.utilisateur }}</td>
                            <td class="text-slate-500">{{ log.detail }}</td>
                            <td class="text-slate-400 whitespace-nowrap">{{ log.date }}</td>
                        </tr>
                    </ng-template>
                    <ng-template #emptymessage>
                        <tr><td colspan="5" class="text-center py-8 text-slate-400">Aucun journal trouvé</td></tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `
})
export class Journaux {
    logs = LOGS;
    filtre = 'tous';
    filtres = [
        { label: 'Tous', value: 'tous' },
        { label: 'Validations', value: 'VALIDATION_RESERVATION' },
        { label: 'Encaissements', value: 'ENCAISSEMENT_PAIEMENT' }
    ];

    filteredLogs() {
        return this.filtre === 'tous' ? this.logs : this.logs.filter(l => l.action === this.filtre);
    }
}
